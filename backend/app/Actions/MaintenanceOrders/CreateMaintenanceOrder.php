<?php

namespace App\Actions\MaintenanceOrders;

use App\Models\MaintenanceOrder;
use App\Models\User;
use App\Services\AuditLogger;

class CreateMaintenanceOrder
{
    public function __construct(
        private NormalizeMaintenanceOrderPayload $normalizer,
        private MaintenanceOrderSideEffects $sideEffects,
        private AuditLogger $auditLogger
    ) {
    }

    public function handle(User $user, array $data): MaintenanceOrder
    {
        $this->sideEffects->ensureVehicleBelongsToUser($data['vehicle_id'] ?? null, $user->company_id);

        $payload = $this->normalizer->handle($data);
        $partsPayload = $payload['parts'] ?? null;
        unset($payload['parts']);
        $payload['company_id'] = $user->company_id;

        $order = $user->maintenanceOrders()->create($payload);

        if ($order->vehicle_id) {
            $this->sideEffects->refreshVehicleStatus($order->vehicle_id, $user->company_id);
            $this->sideEffects->syncVehicleMileageFromOrder($order, $data);
        }

        $this->sideEffects->refreshInspectionStatus($order);
        $this->sideEffects->syncPartsUsed($order, $partsPayload);
        $this->sideEffects->applySparePartUsage($order);
        $this->sideEffects->recordSparePartLifeEvents($order);

        $this->auditLogger->record(
            $user,
            'maintenance_order.created',
            $order,
            [],
            $this->auditLogger->snapshot($order)
        );

        return $order;
    }
}
