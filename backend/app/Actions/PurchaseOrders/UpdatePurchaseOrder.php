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
        unset($payload['company_id'], $payload['user_id']);
        $payload = $this->sideEffects->applySupplierName($payload, $user->company_id);

        $order->update($payload);
        $this->sideEffects->applyInventoryReceipt($order, $previousStatus);

        $this->auditLogger->record(
            $user,
            'purchase_order.updated',
            $order,
            $before,
            $this->auditLogger->snapshot($order->refresh())
        );

        return $order;
    }
}
