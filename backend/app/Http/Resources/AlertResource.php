<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AlertResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $payload = $this->resource->toArray();
        $payload['related_entity_id'] = $payload['related_id'] ?? null;
        $payload['related_entity_type'] = $payload['related_type'] ?? null;

        return $payload;
    }
}
