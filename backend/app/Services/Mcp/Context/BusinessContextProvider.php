<?php

namespace App\Services\Mcp\Context;

use App\Models\Alert;
use App\Models\Document;
use App\Models\Inspection;
use App\Models\MaintenanceOrder;
use App\Models\PurchaseOrder;
use App\Models\SparePart;
use App\Models\Trip;
use App\Models\User;
use App\Models\Vehicle;
use App\Services\Mcp\Contracts\ContextProviderInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class BusinessContextProvider implements ContextProviderInterface
{
    public function build(User $user, array $options = []): array
    {
        $now = Carbon::now();
        $serviceWindowDays = (int) config('ai_policies.thresholds.service_due_days', 30);
        $documentWindowDays = (int) config('ai_policies.thresholds.document_expiration_days', 30);
        $nextServiceWindow = $now->copy()->addDays($serviceWindowDays);
        $nextDocumentWindow = $now->copy()->addDays($documentWindowDays);

        $vehicleCount = Vehicle::query()->where('user_id', $user->id)->count();
        $vehicleStatusCounts = $this->groupCounts(
            Vehicle::query()->where('user_id', $user->id),
            'status'
        );
        $serviceDueCount = Vehicle::query()
            ->where('user_id', $user->id)
            ->whereNotNull('next_service_date')
            ->whereDate('next_service_date', '<=', $nextServiceWindow)
            ->count();

        $maintenanceStatusCounts = $this->groupCounts(
            MaintenanceOrder::query()->where('user_id', $user->id),
            'status'
        );
        $openMaintenance = MaintenanceOrder::query()
            ->where('user_id', $user->id)
            ->whereNotIn('status', ['completado', 'cerrado', 'cancelado'])
            ->count();
        $overdueMaintenance = MaintenanceOrder::query()
            ->where('user_id', $user->id)
            ->whereNotNull('scheduled_date')
            ->where('scheduled_date', '<', $now)
            ->whereNotIn('status', ['completado', 'cerrado', 'cancelado'])
            ->count();
        $avgActualCost = MaintenanceOrder::query()
            ->where('user_id', $user->id)
            ->whereNotNull('actual_cost')
            ->avg('actual_cost');

        $sparePartsTotal = SparePart::query()->where('user_id', $user->id)->count();
        $criticalParts = SparePart::query()
            ->where('user_id', $user->id)
            ->whereColumn('current_stock', '<=', 'minimum_stock')
            ->orderBy('current_stock')
            ->limit(5)
            ->get(['sku', 'name', 'current_stock', 'minimum_stock']);
        $criticalPartsCount = SparePart::query()
            ->where('user_id', $user->id)
            ->whereColumn('current_stock', '<=', 'minimum_stock')
            ->count();

        $purchaseOrderStatusCounts = $this->groupCounts(
            PurchaseOrder::query()->where('user_id', $user->id),
            'status'
        );

        $alertStatusCounts = $this->groupCounts(
            Alert::query()->where('user_id', $user->id),
            'status'
        );
        $alertSeverityCounts = $this->groupCounts(
            Alert::query()->where('user_id', $user->id),
            'severity'
        );
        $alertsOpen = Alert::query()
            ->where('user_id', $user->id)
            ->whereNotIn('status', ['resolved', 'cerrado'])
            ->count();

        $documentsExpiring = Document::query()
            ->where('user_id', $user->id)
            ->whereNotNull('expiration_date')
            ->whereDate('expiration_date', '<=', $nextDocumentWindow)
            ->count();

        $inspectionStatusCounts = $this->groupCounts(
            Inspection::query()->where('user_id', $user->id),
            'overall_status'
        );
        $inspectionsLast30 = Inspection::query()
            ->where('user_id', $user->id)
            ->whereDate('inspection_date', '>=', $now->copy()->subDays(30))
            ->count();

        $tripStatusCounts = $this->groupCounts(
            Trip::query()->where('user_id', $user->id),
            'status'
        );

        $avgCostLabel = $avgActualCost !== null
            ? '$' . number_format((float) $avgActualCost, 2, '.', ',')
            : 'sin datos';

        $summaryLines = [
            "Flota: {$vehicleCount} vehiculos. Estados: {$this->formatStatusCounts($vehicleStatusCounts)}. Servicios proximos ({$serviceWindowDays} dias): {$serviceDueCount}.",
            "Mantenimiento: {$openMaintenance} ordenes abiertas, {$overdueMaintenance} vencidas. Estados: {$this->formatStatusCounts($maintenanceStatusCounts)}.",
            "Repuestos: {$criticalPartsCount} criticos (stock <= minimo) de {$sparePartsTotal} totales.",
            "Compras: {$this->formatStatusCounts($purchaseOrderStatusCounts)}.",
            "Alertas: {$alertsOpen} abiertas. Severidad: {$this->formatStatusCounts($alertSeverityCounts)}.",
            "Documentos: {$documentsExpiring} por vencer en {$documentWindowDays} dias.",
            "Inspecciones: {$inspectionsLast30} en los ultimos 30 dias. Estados: {$this->formatStatusCounts($inspectionStatusCounts)}.",
            "Viajes: {$this->formatStatusCounts($tripStatusCounts)}.",
            "Costo promedio por orden (actual): {$avgCostLabel}.",
        ];

        return [
            'summary' => implode("\n", $summaryLines),
            'stats' => [
                'vehicles' => [
                    'total' => $vehicleCount,
                    'by_status' => $vehicleStatusCounts,
                    'service_due_30d' => $serviceDueCount,
                ],
                'maintenance_orders' => [
                    'open' => $openMaintenance,
                    'overdue' => $overdueMaintenance,
                    'by_status' => $maintenanceStatusCounts,
                    'avg_actual_cost' => $avgActualCost !== null ? (float) $avgActualCost : null,
                ],
                'spare_parts' => [
                    'total' => $sparePartsTotal,
                    'critical' => $criticalPartsCount,
                    'critical_items' => $criticalParts->map(fn ($part) => [
                        'sku' => $part->sku,
                        'name' => $part->name,
                        'current_stock' => $part->current_stock,
                        'minimum_stock' => $part->minimum_stock,
                    ])->all(),
                ],
                'purchase_orders' => [
                    'by_status' => $purchaseOrderStatusCounts,
                ],
                'alerts' => [
                    'open' => $alertsOpen,
                    'by_status' => $alertStatusCounts,
                    'by_severity' => $alertSeverityCounts,
                ],
                'documents' => [
                    'expiring_30d' => $documentsExpiring,
                ],
                'inspections' => [
                    'last_30d' => $inspectionsLast30,
                    'by_status' => $inspectionStatusCounts,
                ],
                'trips' => [
                    'by_status' => $tripStatusCounts,
                ],
            ],
            'generated_at' => $now->toIso8601String(),
        ];
    }

    protected function groupCounts($query, string $column): array
    {
        $counts = $query
            ->select($column, DB::raw('count(*) as total'))
            ->groupBy($column)
            ->pluck('total', $column)
            ->all();

        $normalized = [];
        foreach ($counts as $key => $count) {
            $normalized[(string) $key] = (int) $count;
        }

        return $normalized;
    }

    protected function formatStatusCounts(array $counts): string
    {
        if (empty($counts)) {
            return 'sin datos';
        }

        arsort($counts);

        $parts = [];
        foreach ($counts as $status => $count) {
            $parts[] = "{$status}: {$count}";
        }

        return implode(', ', $parts);
    }
}
