<?php

namespace App\Actions\MaintenanceOrders;

use App\Models\Inspection;
use App\Models\MaintenanceOrder;
use App\Models\MaintenanceOrderPart;
use App\Models\SparePart;
use App\Models\Vehicle;
use App\Services\SparePartLifeService;
use Illuminate\Support\Facades\DB;

class MaintenanceOrderSideEffects
{
    public function __construct(
        private SparePartLifeService $lifeService
    ) {
    }
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

    public function applySparePartUsage(MaintenanceOrder $order): void
    {
        if ($order->status !== 'completada') {
            return;
        }

        $metadata = is_array($order->metadata) ? $order->metadata : [];

        if (!empty($metadata['parts_inventory_applied_at'])) {
            return;
        }

        $partsUsed = $this->resolvePartsForInventory($order);

        if ($partsUsed === []) {
            return;
        }

        DB::transaction(function () use ($order, $metadata, $partsUsed) {
            foreach ($partsUsed as $partUsage) {
                if (!is_array($partUsage)) {
                    continue;
                }

                $quantity = $this->resolveUsageQuantity($partUsage);
                if ($quantity <= 0) {
                    continue;
                }

                $part = $this->resolveSparePart($order->company_id, $partUsage);
                if (!$part) {
                    continue;
                }

                $currentStock = (int) ($part->current_stock ?? 0);
                $nextStock = max(0, $currentStock - $quantity);

                if ($nextStock !== $currentStock) {
                    $part->update(['current_stock' => $nextStock]);
                }
            }

            $metadata['parts_inventory_applied_at'] = now()->toIso8601String();
            $order->forceFill(['metadata' => $metadata])->save();
        });
    }

    public function recordSparePartLifeEvents(MaintenanceOrder $order): void
    {
        $this->lifeService->recordOrderEvents($order);
    }

    public function syncPartsUsed(MaintenanceOrder $order, ?array $parts): void
    {
        if ($parts === null) {
            return;
        }

        $normalized = $this->normalizePartsPayload($parts);
        DB::transaction(function () use ($order, $normalized) {
            $order->partsUsed()->delete();

            if ($normalized === []) {
                return;
            }

            foreach ($normalized as $partUsage) {
                $sparePart = $this->resolveSparePart($order->company_id, $partUsage);
                $quantity = $this->resolveUsageQuantity($partUsage);

                if ($quantity <= 0) {
                    continue;
                }

                $unitCost = $partUsage['unit_cost'] ?? $sparePart?->unit_cost;
                $unitCost = is_numeric($unitCost) ? (float) $unitCost : null;

                $name = $partUsage['name'] ?? $sparePart?->name;
                $sku = $partUsage['sku'] ?? $sparePart?->sku;
                $category = $partUsage['category'] ?? $sparePart?->category;
                $totalCost = $unitCost !== null ? $unitCost * $quantity : null;

                $order->partsUsed()->create([
                    'company_id' => $order->company_id,
                    'spare_part_id' => $sparePart?->id,
                    'name_snapshot' => $name,
                    'sku_snapshot' => $sku,
                    'category_snapshot' => $category,
                    'quantity' => $quantity,
                    'unit_cost' => $unitCost,
                    'total_cost' => $totalCost,
                ]);
            }
        });
    }

    protected function resolvePartsForInventory(MaintenanceOrder $order): array
    {
        $partsUsed = $order->relationLoaded('partsUsed')
            ? $order->partsUsed
            : $order->partsUsed()->get();

        if ($partsUsed->isNotEmpty()) {
            return $partsUsed->map(function (MaintenanceOrderPart $part) {
                return [
                    'part_id' => $part->spare_part_id,
                    'sku' => $part->sku_snapshot,
                    'name' => $part->name_snapshot,
                    'quantity' => $part->quantity,
                ];
            })->all();
        }

        $legacy = $order->parts ?? data_get($order->metadata, 'parts_used', []);

        return $this->normalizePartsPayload(is_array($legacy) ? $legacy : []);
    }

    protected function resolveSparePart(int $companyId, array $partUsage): ?SparePart
    {
        $partId = $partUsage['part_id'] ?? $partUsage['spare_part_id'] ?? null;
        if ($partId) {
            return SparePart::query()
                ->where('id', $partId)
                ->where('company_id', $companyId)
                ->first();
        }

        $sku = $partUsage['sku'] ?? $partUsage['part_sku'] ?? null;
        if ($sku) {
            return SparePart::query()
                ->where('sku', $sku)
                ->where('company_id', $companyId)
                ->first();
        }

        $name = $partUsage['name'] ?? $partUsage['part_name'] ?? null;
        if ($name) {
            return SparePart::query()
                ->where('name', $name)
                ->where('company_id', $companyId)
                ->first();
        }

        return null;
    }

    protected function resolveUsageQuantity(array $partUsage): int
    {
        $quantity = $partUsage['quantity'] ?? $partUsage['qty'] ?? $partUsage['quantity_needed'] ?? 0;
        $quantity = is_numeric($quantity) ? (int) $quantity : 0;

        return max(0, $quantity);
    }

    protected function normalizePartsPayload(array $parts): array
    {
        $normalized = [];

        foreach ($parts as $part) {
            if (!is_array($part)) {
                continue;
            }

            $quantity = $this->resolveUsageQuantity($part);
            if ($quantity <= 0) {
                continue;
            }

            $normalized[] = [
                'part_id' => $part['part_id'] ?? $part['spare_part_id'] ?? null,
                'sku' => $part['sku'] ?? $part['part_sku'] ?? null,
                'name' => $part['name'] ?? $part['part_name'] ?? null,
                'category' => $part['category'] ?? null,
                'unit_cost' => $part['unit_cost'] ?? $part['cost'] ?? null,
                'quantity' => $quantity,
            ];
        }

        return array_values(array_filter($normalized, function (array $part) {
            return $part['part_id'] || $part['sku'] || $part['name'];
        }));
    }
}
