<?php

namespace App\Jobs;

use App\Models\GpsPosition;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class IngestTelemetryBatchJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    /**
     * @param array<int, array<string, mixed>> $points
     */
    public function __construct(
        public int $companyId,
        public int $userId,
        public ?int $vehicleId,
        public ?int $tripId,
        public array $points,
        public string $source = 'api'
    ) {
    }

    public function handle(): void
    {
        if ($this->points === []) {
            return;
        }

        $now = now();
        $rows = [];

        foreach ($this->points as $point) {
            if (!is_array($point)) {
                continue;
            }

            $metadata = $point['metadata'] ?? [];
            if (is_array($metadata)) {
                $metadata = array_merge(['source' => $this->source], $metadata);
            }

            $rows[] = [
                'company_id' => $this->companyId,
                'user_id' => $this->userId,
                'vehicle_id' => $this->vehicleId,
                'trip_id' => $this->tripId,
                'latitude' => $point['lat'],
                'longitude' => $point['lng'],
                'speed_kph' => $point['speed_kph'] ?? null,
                'heading' => $point['heading'] ?? null,
                'altitude' => $point['altitude'] ?? null,
                'accuracy' => $point['accuracy'] ?? null,
                'recorded_at' => $point['recorded_at'] ?? $now,
                'metadata' => is_array($metadata) ? json_encode($metadata) : $metadata,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if ($rows === []) {
            return;
        }

        GpsPosition::insert($rows);
    }
}
