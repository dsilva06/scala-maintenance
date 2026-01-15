<?php

namespace App\Actions\Inspections;

use App\Models\Inspection;
use App\Models\MaintenanceOrder;
use App\Models\Vehicle;

class InspectionSideEffects
{
    public function handle(Inspection $inspection): void
    {
        if ($inspection->vehicle_id) {
            $status = match ($inspection->overall_status) {
                'mantenimiento' => 'fuera_servicio',
                default => null,
            };

            if ($status) {
                Vehicle::where('id', $inspection->vehicle_id)
                    ->where('company_id', $inspection->company_id)
                    ->update(['status' => $status]);
            }
        }

        if ($inspection->overall_status !== 'mantenimiento') {
            return;
        }

        $hasOpenOrder = MaintenanceOrder::where('company_id', $inspection->company_id)
            ->where('metadata->inspection_id', $inspection->id)
            ->whereIn('status', ['pendiente', 'en_progreso'])
            ->exists();

        if ($hasOpenOrder) {
            return;
        }

        MaintenanceOrder::create([
            'user_id' => $inspection->user_id,
            'company_id' => $inspection->company_id,
            'vehicle_id' => $inspection->vehicle_id,
            'order_number' => 'MNT-INS-' . now()->format('YmdHis'),
            'type' => 'correctivo',
            'priority' => 'critica',
            'status' => 'pendiente',
            'description' => "Generado por inspección ({$inspection->overall_status})",
            'mechanic' => $inspection->inspector,
            'notes' => 'Orden creada automáticamente desde inspección.',
            'metadata' => [
                'inspection_id' => $inspection->id,
            ],
        ]);
    }
}
