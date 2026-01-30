<?php

namespace App\Actions\MaintenanceOrders;

use App\Models\User;
use App\Models\MaintenanceOrder;
use App\Services\AuditLogger;

class UpdateMaintenanceOrder
{
    public function __construct(
        private NormalizeMaintenanceOrderPayload $normalizer,
        private MaintenanceOrderSideEffects $sideEffects,
        private AuditLogger $auditLogger
    ) {
    }

    public function handle(User $user, MaintenanceOrder $order, array $data): MaintenanceOrder
    {
        if (array_key_exists('vehicle_id', $data)) {
            $this->sideEffects->ensureVehicleBelongsToUser($data['vehicle_id'], $user->company_id);
        }

        $before = $this->auditLogger->snapshot($order);
        $payload = $this->normalizer->handle($data);
        $partsPayload = $payload['parts'] ?? null;
        unset($payload['parts']);
        unset($payload['company_id'], $payload['user_id']);

        $order->update($payload);

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
            'maintenance_order.updated',
            $order,
            $before,
            $this->auditLogger->snapshot($order->refresh())
        );

        return $order;
    }
}
