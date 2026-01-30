<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = $this->resource->toArray();

        if ($this->resource->relationLoaded('tirePositions')) {
            $data['tire_positions'] = $this->resource->tirePositions;
        }

        if ($this->resource->relationLoaded('activeTireAssignments')) {
            $data['active_tire_assignments'] = $this->resource->activeTireAssignments;
        }

        return $data;
    }
}
