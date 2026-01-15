<?php

namespace App\Actions\MaintenanceOrders;

use App\Models\Inspection;
use App\Models\MaintenanceOrder;
use App\Models\Vehicle;

class MaintenanceOrderSideEffects
{
    public function ensureVehicleBelongsToUser(?int $vehicleId, int $companyId): void
    {
        if ($vehicleId === null) {
            return;
        }

        $ownsVehicle = Vehicle::whereKey($vehicleId)
            ->where('company_id', $companyId)
            ->exists();

        if (!$ownsVehicle) {
            abort(422, 'El vehículo seleccionado no pertenece al usuario autenticado.');
        }
    }

    public function refreshVehicleStatus(int $vehicleId, int $companyId): void
    {
        $openStatuses = ['pendiente', 'en_progreso'];

        $hasOpenOrders = MaintenanceOrder::where('vehicle_id', $vehicleId)
            ->where('company_id', $companyId)
            ->whereIn('status', $openStatuses)
            ->exists();

        $newStatus = $hasOpenOrders ? 'mantenimiento' : 'activo';

        Vehicle::where('id', $vehicleId)
            ->where('company_id', $companyId)
            ->update(['status' => $newStatus]);
    }

    public function syncVehicleMileageFromOrder(MaintenanceOrder $order, array $attributes): void
    {
        if ($order->status !== 'completada') {
            return;
        }

        $completionMileage = $attributes['completion_mileage'] ?? null;

        if ($completionMileage === null) {
            return;
        }

        $vehicle = Vehicle::where('id', $order->vehicle_id)
            ->where('company_id', $order->company_id)
            ->first();

        if (!$vehicle) {
            return;
        }

        $currentMileage = (int) ($vehicle->current_mileage ?? 0);
        $newMileage = max($currentMileage, (int) $completionMileage);

        $updates = ['current_mileage' => $newMileage];

        if ($order->completion_date) {
            $updates['last_service_date'] = $order->completion_date->toDateString();
        }

        $vehicle->update($updates);
    }

    public function refreshInspectionStatus(MaintenanceOrder $order): void
    {
        $inspectionId = data_get($order->metadata, 'inspection_id');

        if (!$inspectionId) {
            return;
        }

        $inspection = Inspection::where('id', $inspectionId)
            ->where('company_id', $order->company_id)
            ->first();

        if (!$inspection) {
            return;
        }

        $baseQuery = MaintenanceOrder::where('company_id', $order->company_id)
            ->where('metadata->inspection_id', $inspectionId);

        if ((clone $baseQuery)->count() === 0) {
            return;
        }

        $hasIncomplete = (clone $baseQuery)
            ->where('status', '!=', 'completada')
            ->exists();

        $nextStatus = $hasIncomplete ? 'mantenimiento' : 'ok';

        if ($inspection->overall_status !== $nextStatus) {
            $inspection->update(['overall_status' => $nextStatus]);
        }
    }
}
