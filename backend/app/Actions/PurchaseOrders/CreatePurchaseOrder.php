<?php

namespace App\Actions\PurchaseOrders;

use App\Models\PurchaseOrder;
use App\Models\User;
use App\Services\AuditLogger;

class CreatePurchaseOrder
{
    public function __construct(
        private NormalizePurchaseOrderPayload $normalizer,
        private PurchaseOrderSideEffects $sideEffects,
        private AuditLogger $auditLogger
    ) {
    }

    public function handle(User $user, array $data): PurchaseOrder
    {
        $payload = $this->normalizer->handle($data);
        $items = array_key_exists('items', $payload) ? $payload['items'] : null;
        unset($payload['items']);
        $payload = $this->sideEffects->applySupplierName($payload, $user->company_id);
        $payload['company_id'] = $user->company_id;

        if (is_array($items)) {
            $items = $this->sideEffects->normalizeItemsPayload($items);
            $payload = $this->sideEffects->hydrateTotalsFromItems($payload, $items);
        } else {
            $items = $this->sideEffects->buildLegacyItemsPayload($payload);
            $payload = $this->sideEffects->hydrateTotalsFromItems($payload, $items);
        }

        $order = $user->purchaseOrders()->create($payload);
        $this->sideEffects->syncItems($order, $items);
        $this->sideEffects->applyInventoryReceipt($order, null);
        $this->sideEffects->linkSupplierToSparePart($order);

        $this->auditLogger->record(
            $user,
            'purchase_order.created',
            $order,
            [],
            $this->auditLogger->snapshot($order)
        );

        return $order->load('items');
    }
}
