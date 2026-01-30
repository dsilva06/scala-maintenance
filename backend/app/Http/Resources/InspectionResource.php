<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InspectionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = $this->resource->toArray();

        if ($this->resource->relationLoaded('tireInspections')) {
            $data['tire_inspections'] = $this->resource->tireInspections;
        }

        return $data;
    }
}
