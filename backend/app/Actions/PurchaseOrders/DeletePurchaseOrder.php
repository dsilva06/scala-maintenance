<?php

namespace App\Actions\PurchaseOrders;

use App\Models\User;
use App\Models\PurchaseOrder;
use App\Services\AuditLogger;

class DeletePurchaseOrder
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function handle(User $user, PurchaseOrder $order): void
    {
        $before = $this->auditLogger->snapshot($order);
        $order->delete();

        $this->auditLogger->record($user, 'purchase_order.deleted', $order, $before, []);
    }
}
