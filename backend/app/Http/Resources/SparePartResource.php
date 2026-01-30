<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Services\SparePartLifeService;

class SparePartResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $part = $this->resource;
        $part->makeHidden(['lifeStat']);
        $life = app(SparePartLifeService::class)->buildSnapshot($part);

        return array_merge($part->toArray(), [
            'life' => $life,
        ]);
    }
}
