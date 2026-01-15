<?php

namespace App\Http\Middleware;

use App\Services\Telemetry\TelemetryService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use OpenTelemetry\API\Globals;
use OpenTelemetry\API\Trace\SpanKind;
use OpenTelemetry\API\Trace\StatusCode;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class ObservabilityMiddleware
{
    public function __construct(private TelemetryService $telemetry)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $requestId = $request->headers->get('X-Request-Id') ?? (string) Str::uuid();
        $request->headers->set('X-Request-Id', $requestId);

        $userId = $request->user()?->id;
        $routeName = $request->route()?->getName();

        Log::withContext([
            'request_id' => $requestId,
            'user_id' => $userId,
            'route' => $routeName,
            'path' => $request->path(),
        ]);

        $span = null;
        $scope = null;

        if (config('telemetry.enabled') && class_exists(Globals::class)) {
            $route = $routeName ?: ($request->route()?->uri() ? '/' . ltrim($request->route()->uri(), '/') : $request->path());
            $spanBuilder = Globals::tracerProvider()
                ->getTracer('fleet-http')
                ->spanBuilder(sprintf('%s %s', $request->getMethod(), $route))
                ->setSpanKind(SpanKind::KIND_SERVER)
                ->setAttribute('http.request_id', $requestId)
                ->setAttribute('http.method', $request->getMethod())
                ->setAttribute('http.route', $route);

            if ($userId !== null) {
                $spanBuilder->setAttribute('enduser.id', (string) $userId);
            }

            $span = $spanBuilder->startSpan();
            $scope = $span->activate();
        }

        $start = microtime(true);

        try {
            $response = $next($request);
        } catch (Throwable $e) {
            if ($span) {
                $span->recordException($e);
                $span->setStatus(StatusCode::STATUS_ERROR, $e->getMessage());
            }

            throw $e;
        } finally {
            $durationMs = (microtime(true) - $start) * 1000;
            if (isset($response)) {
                $this->telemetry->recordHttpRequest($request, $response, $durationMs);
                $response->headers->set('X-Request-Id', $requestId);
                if ($span) {
                    $span->setAttribute('http.status_code', $response->getStatusCode());
                }
            }

            if ($scope) {
                $scope->detach();
            }
            if ($span) {
                $span->end();
            }
        }

        return $response;
    }
}
