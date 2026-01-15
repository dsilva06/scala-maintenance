<?php

namespace App\Actions\PurchaseOrders;

use App\Models\PurchaseOrder;
use App\Models\SparePart;
use App\Models\Supplier;

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

    public function applyInventoryReceipt(PurchaseOrder $order, ?string $previousStatus): void
    {
        if ($order->status !== 'received') {
            return;
        }

        if ($previousStatus === 'received' || $order->received_at) {
            return;
        }

        if (!$order->spare_part_id) {
            $order->forceFill(['received_at' => now()])->save();
            return;
        }

        $quantity = max(0, (int) $order->items_count);

        if ($quantity <= 0) {
            $order->forceFill(['received_at' => now()])->save();
            return;
        }

        $part = SparePart::query()
            ->where('id', $order->spare_part_id)
            ->where('company_id', $order->company_id)
            ->first();

        if (!$part) {
            return;
        }

        $part->increment('current_stock', $quantity);
        $order->forceFill(['received_at' => now()])->save();
    }
}
