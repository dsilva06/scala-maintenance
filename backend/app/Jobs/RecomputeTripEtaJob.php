<?php

namespace App\Jobs;

use App\Models\Trip;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RecomputeTripEtaJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(public int $tripId)
    {
    }

    public function handle(): void
    {
        $trip = Trip::find($this->tripId);

        if (!$trip || !$trip->start_date || !$trip->distance_planned) {
            return;
        }

        if (data_get($trip->metadata, 'eta_locked')) {
            return;
        }

        if ($trip->estimated_arrival && data_get($trip->metadata, 'eta_source') !== 'computed') {
            return;
        }

        $speed = (int) config('fleet.eta_default_speed_kmh', 60);
        $speed = $speed > 0 ? $speed : 60;

        $minutes = (int) round(($trip->distance_planned / $speed) * 60);
        $eta = $trip->start_date->copy()->addMinutes($minutes);

        $metadata = $trip->metadata ?? [];
        $metadata['eta_last_computed_at'] = now()->toIso8601String();
        $metadata['eta_speed_kmh'] = $speed;
        $metadata['eta_source'] = 'computed';

        $trip->forceFill([
            'estimated_arrival' => $eta,
            'metadata' => $metadata,
        ])->save();
    }
}
