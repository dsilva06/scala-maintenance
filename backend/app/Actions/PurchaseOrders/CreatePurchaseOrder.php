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
        $payload = $this->sideEffects->applySupplierName($payload, $user->company_id);
        $payload['company_id'] = $user->company_id;

        $order = $user->purchaseOrders()->create($payload);
        $this->sideEffects->applyInventoryReceipt($order, null);

        $this->auditLogger->record(
            $user,
            'purchase_order.created',
            $order,
            [],
            $this->auditLogger->snapshot($order)
        );

        return $order;
    }
}
