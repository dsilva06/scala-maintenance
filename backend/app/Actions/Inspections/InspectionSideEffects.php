<?php

namespace App\Actions\Inspections;

use App\Models\Inspection;
use App\Models\MaintenanceOrder;
use App\Models\Vehicle;

class InspectionSideEffects
{
    private function buildMaintenanceTitle(Inspection $inspection): string
    {
        $items = $inspection->checklist_items ?? [];

        if (!is_array($items) || count($items) === 0) {
            return 'Mantenimiento por inspeccion';
        }

        $needsMaintenance = array_values(array_filter($items, function ($item) {
            $status = $item['status'] ?? null;
            return in_array($status, ['critico', 'observacion'], true);
        }));

        if (count($needsMaintenance) === 0) {
            return 'Mantenimiento por inspeccion';
        }

        $primary = $needsMaintenance[0];
        $itemName = trim((string) ($primary['item'] ?? ''));
        $category = trim((string) ($primary['category'] ?? ''));

        $title = $itemName !== '' ? $itemName : 'Mantenimiento por inspeccion';

        if ($category !== '' && $itemName !== '') {
            $title .= " ({$category})";
        }

        $extraCount = count($needsMaintenance) - 1;
        if ($extraCount > 0) {
            $title .= " (+{$extraCount})";
        }

        return $title;
    }

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

        $title = $this->buildMaintenanceTitle($inspection);

        MaintenanceOrder::create([
            'user_id' => $inspection->user_id,
            'company_id' => $inspection->company_id,
            'vehicle_id' => $inspection->vehicle_id,
            'order_number' => 'MNT-INS-' . now()->format('YmdHis'),
            'type' => 'correctivo',
            'priority' => 'critica',
            'status' => 'pendiente',
            'title' => $title,
            'description' => "Generado por inspeccion ({$inspection->overall_status})",
            'mechanic' => $inspection->inspector,
            'notes' => 'Orden creada automáticamente desde inspección.',
            'metadata' => [
                'source' => 'inspection',
                'inspection_id' => $inspection->id,
                'inspection_status' => $inspection->overall_status,
            ],
        ]);
    }
}
