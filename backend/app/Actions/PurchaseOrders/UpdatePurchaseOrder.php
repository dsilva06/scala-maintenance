<?php

namespace App\Actions\PurchaseOrders;

use App\Models\User;
use App\Models\PurchaseOrder;
use App\Services\AuditLogger;

class UpdatePurchaseOrder
{
    public function __construct(
        private NormalizePurchaseOrderPayload $normalizer,
        private PurchaseOrderSideEffects $sideEffects,
        private AuditLogger $auditLogger
    ) {
    }

    public function handle(User $user, PurchaseOrder $order, array $data): PurchaseOrder
    {
        $previousStatus = $order->status;
        $before = $this->auditLogger->snapshot($order);
        $payload = $this->normalizer->handle($data);
        $itemsProvided = array_key_exists('items', $payload);
        $items = $itemsProvided ? $payload['items'] : null;
        unset($payload['company_id'], $payload['user_id']);
        unset($payload['items']);
        $payload = $this->sideEffects->applySupplierName($payload, $user->company_id);

        if ($itemsProvided) {
            $items = is_array($items) ? $this->sideEffects->normalizeItemsPayload($items) : [];
            $payload = $this->sideEffects->hydrateTotalsFromItems($payload, $items);
        } elseif (!$order->items()->exists()) {
            $hasLegacyFields = array_intersect_key($payload, array_flip([
                'product_name',
                'spare_part_id',
                'items_count',
                'total_cost',
            ]));

            if ($hasLegacyFields) {
                $items = $this->sideEffects->buildLegacyItemsPayload($payload);
                $payload = $this->sideEffects->hydrateTotalsFromItems($payload, $items);
            } else {
                $items = null;
            }
        } else {
            $items = null;
        }

        $order->update($payload);
        $this->sideEffects->syncItems($order, $items);
        $this->sideEffects->applyInventoryReceipt($order, $previousStatus);
        $this->sideEffects->linkSupplierToSparePart($order);

        $this->auditLogger->record(
            $user,
            'purchase_order.updated',
            $order,
            $before,
            $this->auditLogger->snapshot($order->refresh())
        );

        return $order->load('items');
    }
}
