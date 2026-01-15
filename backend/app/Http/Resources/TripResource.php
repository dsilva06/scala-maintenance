<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TripResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $trip = $this->resource;
        $data = $trip->toArray();

        if ($trip->relationLoaded('latestPosition') && $trip->latestPosition) {
            $data['current_position'] = $this->formatPosition($trip->latestPosition);
        }

        if ($trip->relationLoaded('positions')) {
            $positions = $trip->positions
                ->sortBy('recorded_at')
                ->values();

            $data['position_history'] = $positions
                ->map(fn ($position) => $this->formatPosition($position))
                ->all();
        }

        return $data;
    }

    protected function formatPosition($position): array
    {
        return [
            'id' => $position->id,
            'lat' => $position->latitude,
            'lng' => $position->longitude,
            'speed_kph' => $position->speed_kph,
            'heading' => $position->heading,
            'recorded_at' => optional($position->recorded_at)->toIso8601String(),
        ];
    }
}
