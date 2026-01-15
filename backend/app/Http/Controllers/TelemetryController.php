<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\AuthorizesCompanyResource;
use App\Http\Requests\TelemetryIngestRequest;
use App\Jobs\IngestTelemetryBatchJob;
use App\Models\GpsPosition;
use App\Models\Trip;
use App\Support\CompanyScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TelemetryController extends Controller
{
    use AuthorizesCompanyResource;

    public function ingest(TelemetryIngestRequest $request): JsonResponse
    {
        $this->authorizeCompanyWrite($request);

        $validated = $request->validated();
        $user = $request->user();

        $tripId = $validated['trip_id'] ?? null;
        $vehicleId = $validated['vehicle_id'] ?? null;

        if ($tripId && !$vehicleId) {
            $vehicleId = CompanyScope::apply(Trip::query(), $user)
                ->whereKey($tripId)
                ->value('vehicle_id');
        }

        IngestTelemetryBatchJob::dispatch(
            $user->company_id,
            $user->id,
            $vehicleId,
            $tripId,
            $validated['points'],
            $validated['source'] ?? 'api'
        )->afterCommit();

        return response()->json([
            'data' => [
                'queued' => true,
                'points' => count($validated['points']),
            ],
        ], 202);
    }

    public function stream(Request $request): StreamedResponse
    {
        $user = $request->user();

        return response()->stream(function () use ($request, $user) {
            $tripId = $request->query('trip_id');
            $vehicleId = $request->query('vehicle_id');
            $cursor = (int) ($request->header('Last-Event-ID') ?: $request->query('last_id', 0));
            $sleepMs = (int) config('fleet.telemetry.stream_sleep_ms', 1000);
            $timeoutSeconds = (int) config('fleet.telemetry.stream_timeout_seconds', 20);
            $startedAt = time();

            while (true) {
                if (connection_aborted()) {
                    break;
                }

                $query = CompanyScope::apply(GpsPosition::query(), $user)
                    ->where('id', '>', $cursor)
                    ->orderBy('id')
                    ->limit(200);

                if ($tripId) {
                    $query->where('trip_id', $tripId);
                }
                if ($vehicleId) {
                    $query->where('vehicle_id', $vehicleId);
                }

                $positions = $query->get();

                foreach ($positions as $position) {
                    $payload = [
                        'id' => $position->id,
                        'trip_id' => $position->trip_id,
                        'vehicle_id' => $position->vehicle_id,
                        'position' => [
                            'lat' => $position->latitude,
                            'lng' => $position->longitude,
                            'speed_kph' => $position->speed_kph,
                            'heading' => $position->heading,
                            'recorded_at' => optional($position->recorded_at)->toIso8601String(),
                        ],
                    ];

                    echo "id: {$position->id}\n";
                    echo "event: gps.position\n";
                    echo 'data: ' . json_encode($payload) . "\n\n";

                    $cursor = $position->id;
                }

                echo "event: heartbeat\n";
                echo "data: {}\n\n";
                ob_flush();
                flush();

                if ((time() - $startedAt) >= $timeoutSeconds) {
                    break;
                }

                usleep(max($sleepMs, 200) * 1000);
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
