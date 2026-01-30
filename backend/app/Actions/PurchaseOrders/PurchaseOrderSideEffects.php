<?php

namespace App\Actions\PurchaseOrders;

use App\Models\PurchaseOrder;
use App\Models\SparePart;
use App\Models\Supplier;
use Illuminate\Support\Facades\DB;

class PurchaseOrderSideEffects
{
    public function applySupplierName(array $attributes, int $companyId): array
    {
        if (!empty($attributes['supplier_id']) && empty($attributes['supplier'])) {
            $supplierName = Supplier::where('id', $attributes['supplier_id'])
                ->where('company_id', $companyId)
                ->value('name');

            if ($supplierName) {
                $attributes['supplier'] = $supplierName;
            }
        }

        return $attributes;
    }

    public function normalizeItemsPayload(array $items): array
    {
        $normalized = [];

        foreach ($items as $item) {
            if (!is_array($item)) {
                continue;
            }

            $quantity = $this->resolveItemQuantity($item);
            if ($quantity <= 0) {
                continue;
            }

            $productName = $item['product_name'] ?? $item['name'] ?? null;
            if (is_string($productName)) {
                $productName = trim($productName);
                $productName = $productName === '' ? null : $productName;
            } else {
                $productName = null;
            }

            $sparePartId = $item['spare_part_id'] ?? $item['part_id'] ?? null;
            $sparePartId = is_numeric($sparePartId) ? (int) $sparePartId : null;

            $unitCost = $item['unit_cost'] ?? $item['unit_price'] ?? null;
            $unitCost = is_numeric($unitCost) ? (float) $unitCost : null;

            $totalCost = $item['total_cost'] ?? $item['total'] ?? null;
            $totalCost = is_numeric($totalCost) ? (float) $totalCost : null;

            if ($totalCost === null && $unitCost !== null) {
                $totalCost = $unitCost * $quantity;
            }

            $normalized[] = [
                'spare_part_id' => $sparePartId,
                'product_name' => $productName,
                'quantity' => $quantity,
                'unit_cost' => $unitCost,
                'total_cost' => $totalCost,
            ];
        }

        return array_values(array_filter($normalized, function (array $item) {
            return $item['spare_part_id'] || $item['product_name'];
        }));
    }

    public function hydrateTotalsFromItems(array $payload, array $items): array
    {
        if ($items === []) {
            $payload['items_count'] = 0;
            $payload['total_cost'] = null;

            if (!array_key_exists('product_name', $payload)) {
                $payload['product_name'] = null;
            }

            if (!array_key_exists('spare_part_id', $payload)) {
                $payload['spare_part_id'] = null;
            }

            return $payload;
        }

        $itemsCount = 0;
        $totalCost = 0;
        $hasCost = false;
        $firstName = null;
        $firstPartId = null;

        foreach ($items as $item) {
            $quantity = $this->resolveItemQuantity($item);
            if ($quantity <= 0) {
                continue;
            }

            $itemsCount += $quantity;

            if ($firstName === null && !empty($item['product_name'])) {
                $firstName = $item['product_name'];
            }

            if ($firstPartId === null && !empty($item['spare_part_id'])) {
                $firstPartId = (int) $item['spare_part_id'];
            }

            if (array_key_exists('total_cost', $item) && is_numeric($item['total_cost'])) {
                $totalCost += (float) $item['total_cost'];
                $hasCost = true;
                continue;
            }

            if (array_key_exists('unit_cost', $item) && is_numeric($item['unit_cost'])) {
                $totalCost += (float) $item['unit_cost'] * $quantity;
                $hasCost = true;
            }
        }

        $payload['items_count'] = $itemsCount;
        $payload['total_cost'] = $hasCost ? round($totalCost, 2) : null;

        if ($firstName !== null) {
            $payload['product_name'] = $firstName;
        }

        if ($firstPartId !== null) {
            $payload['spare_part_id'] = $firstPartId;
        }

        return $payload;
    }

    public function buildLegacyItemsPayload(array $payload): array
    {
        $quantity = $this->resolveItemQuantity($payload);
        if ($quantity <= 0) {
            return [];
        }

        $productName = $payload['product_name'] ?? null;
        $productName = is_string($productName) ? trim($productName) : $productName;
        $productName = $productName === '' ? null : $productName;

        $sparePartId = $payload['spare_part_id'] ?? null;
        $sparePartId = is_numeric($sparePartId) ? (int) $sparePartId : null;

        $totalCost = $payload['total_cost'] ?? null;
        $totalCost = is_numeric($totalCost) ? (float) $totalCost : null;

        $unitCost = null;
        if ($totalCost !== null && $quantity > 0) {
            $unitCost = $totalCost / $quantity;
        }

        if (!$productName && !$sparePartId) {
            return [];
        }

        return [[
            'spare_part_id' => $sparePartId,
            'product_name' => $productName,
            'quantity' => $quantity,
            'unit_cost' => $unitCost,
            'total_cost' => $totalCost,
        ]];
    }

    public function syncItems(PurchaseOrder $order, ?array $items): void
    {
        if ($items === null) {
            return;
        }

        $normalized = $this->normalizeItemsPayload($items);

        DB::transaction(function () use ($order, $normalized) {
            $order->items()->delete();

            if ($normalized === []) {
                return;
            }

            foreach ($normalized as $item) {
                $order->items()->create([
                    'company_id' => $order->company_id,
                    'spare_part_id' => $item['spare_part_id'],
                    'product_name' => $item['product_name'],
                    'quantity' => $item['quantity'],
                    'unit_cost' => $item['unit_cost'],
                    'total_cost' => $item['total_cost'],
                ]);
            }
        });
    }

    public function applyInventoryReceipt(PurchaseOrder $order, ?string $previousStatus): void
    {
        if ($order->status !== 'received') {
            return;
        }

        if ($previousStatus === 'received' || $order->received_at) {
            return;
        }

        $items = $this->resolveInventoryItems($order);

        foreach ($items as $item) {
            $partId = $item['spare_part_id'] ?? null;
            $quantity = $item['quantity'] ?? 0;

            if (!$partId || $quantity <= 0) {
                continue;
            }

            $part = SparePart::query()
                ->where('id', $partId)
                ->where('company_id', $order->company_id)
                ->first();

            if (!$part) {
                continue;
            }

            $part->increment('current_stock', $quantity);
        }

        $order->forceFill(['received_at' => now()])->save();
    }

    public function linkSupplierToSparePart(PurchaseOrder $order): void
    {
        if (!$order->supplier_id) {
            return;
        }

        $partIds = $this->resolveSupplierPartIds($order);

        if ($partIds === []) {
            return;
        }

        $parts = SparePart::query()
            ->where('company_id', $order->company_id)
            ->whereIn('id', $partIds)
            ->get();

        foreach ($parts as $part) {
            $part->suppliers()->syncWithoutDetaching([
                $order->supplier_id => [
                    'company_id' => $order->company_id,
                ],
            ]);
        }
    }

    protected function resolveItemQuantity(array $item): int
    {
        $quantity = $item['quantity'] ?? $item['qty'] ?? $item['items_count'] ?? 0;
        $quantity = is_numeric($quantity) ? (int) $quantity : 0;

        return max(0, $quantity);
    }

    protected function resolveInventoryItems(PurchaseOrder $order): array
    {
        $items = $order->relationLoaded('items')
            ? $order->items
            : $order->items()->get();

        if ($items->isNotEmpty()) {
            return $items->map(function ($item) {
                return [
                    'spare_part_id' => $item->spare_part_id,
                    'quantity' => (int) $item->quantity,
                ];
            })->all();
        }

        if (!$order->spare_part_id) {
            return [];
        }

        $quantity = max(0, (int) $order->items_count);
        if ($quantity <= 0) {
            return [];
        }

        return [[
            'spare_part_id' => (int) $order->spare_part_id,
            'quantity' => $quantity,
        ]];
    }

    protected function resolveSupplierPartIds(PurchaseOrder $order): array
    {
        $items = $order->relationLoaded('items')
            ? $order->items
            : $order->items()->get();

        if ($items->isNotEmpty()) {
            return $items
                ->pluck('spare_part_id')
                ->filter()
                ->unique()
                ->map(fn ($id) => (int) $id)
                ->values()
                ->all();
        }

        if ($order->spare_part_id) {
            return [(int) $order->spare_part_id];
        }

        return [];
    }
}
