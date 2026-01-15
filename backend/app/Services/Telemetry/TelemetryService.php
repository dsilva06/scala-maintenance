<?php

namespace App\Services\Telemetry;

use Illuminate\Http\Request;
use OpenTelemetry\API\Globals;
use OpenTelemetry\API\Metrics\CounterInterface;
use OpenTelemetry\API\Metrics\HistogramInterface;
use Symfony\Component\HttpFoundation\Response;

class TelemetryService
{
    private ?CounterInterface $requestCounter = null;
    private ?HistogramInterface $requestDuration = null;

    public function recordHttpRequest(Request $request, Response $response, float $durationMs): void
    {
        if (!config('telemetry.enabled')) {
            return;
        }

        $meter = Globals::meterProvider()->getMeter('fleet-http');

        $this->requestCounter ??= $meter->createCounter(
            'http.server.requests',
            '1',
            'Count of HTTP requests'
        );
        $this->requestDuration ??= $meter->createHistogram(
            'http.server.duration',
            'ms',
            'Duration of HTTP requests'
        );

        $route = $request->route();
        $routeName = $route?->getName();
        $routeUri = $route?->uri();

        $attributes = [
            'http.method' => $request->getMethod(),
            'http.route' => $routeName ?: ($routeUri ? '/' . ltrim($routeUri, '/') : $request->path()),
            'http.status_code' => $response->getStatusCode(),
        ];

        $this->requestCounter->add(1, $attributes);
        $this->requestDuration->record($durationMs, $attributes);
    }
}
