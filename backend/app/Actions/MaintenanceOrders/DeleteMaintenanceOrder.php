<?php

namespace App\Actions\MaintenanceOrders;

use App\Models\User;
use App\Models\MaintenanceOrder;
use App\Services\AuditLogger;

class DeleteMaintenanceOrder
{
    public function __construct(
        private MaintenanceOrderSideEffects $sideEffects,
        private AuditLogger $auditLogger
    )
    {
    }

    public function handle(User $user, MaintenanceOrder $order): void
    {
        $vehicleId = $order->vehicle_id;
        $companyId = $order->company_id;
        $before = $this->auditLogger->snapshot($order);

        $order->delete();

        if ($vehicleId) {
            $this->sideEffects->refreshVehicleStatus($vehicleId, $companyId);
        }

        $this->sideEffects->refreshInspectionStatus($order);

        $this->auditLogger->record($user, 'maintenance_order.deleted', $order, $before, []);
    }
}
