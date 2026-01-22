<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaintenanceOrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $payload = $this->resource->toArray();

        if ($this->resource->relationLoaded('partsUsed')) {
            $payload['parts'] = $this->resource->partsUsed
                ->map(function ($part) {
                    $quantity = (int) ($part->quantity ?? 0);
                    $unitCost = $part->unit_cost !== null ? (float) $part->unit_cost : null;
                    $lineTotal = $part->total_cost !== null
                        ? (float) $part->total_cost
                        : ($unitCost !== null ? $quantity * $unitCost : null);

                    return [
                        'part_id' => $part->spare_part_id,
                        'name' => $part->name_snapshot,
                        'sku' => $part->sku_snapshot,
                        'category' => $part->category_snapshot,
                        'quantity' => $quantity,
                        'unit_cost' => $unitCost,
                        'line_total' => $lineTotal,
                    ];
                })
                ->all();
        }

        return $payload;
    }
}
