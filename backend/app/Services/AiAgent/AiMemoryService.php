<?php

namespace App\Services\AiAgent;

use App\Models\AiAction;
use App\Models\AiMemory;
use App\Models\User;

class AiMemoryService
{
    public function recordFromAction(AiAction $action, User $user): ?AiMemory
    {
        if ($action->status !== 'executed') {
            return null;
        }

        $arguments = is_array($action->arguments) ? $action->arguments : [];
        $result = is_array($action->result) ? $action->result : [];

        $payload = $this->buildPayload($action->tool, $arguments, $result);

        if (!$payload) {
            return null;
        }

        $payload['user_id'] = $user->id;
        $payload['action'] = $action->tool;

        if (!empty($payload['entity_id'])) {
            return AiMemory::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'entity_type' => $payload['entity_type'],
                    'entity_id' => $payload['entity_id'],
                ],
                $payload
            );
        }

        return AiMemory::create($payload);
    }

    protected function buildPayload(string $tool, array $arguments, array $result): ?array
    {
        switch ($tool) {
            case 'create_vehicle':
                return $this->vehicleMemory($arguments, $result);
            case 'create_maintenance_order':
                return $this->maintenanceOrderMemory($arguments, $result, 'created');
            case 'update_maintenance_order':
                return $this->maintenanceOrderMemory($arguments, $result, 'updated');
            case 'create_purchase_order':
                return $this->purchaseOrderMemory($arguments, $result);
            case 'update_spare_part_stock':
                return $this->sparePartStockMemory($arguments, $result);
            case 'create_alert':
                return $this->alertMemory($arguments, $result);
            default:
                return null;
        }
    }

    protected function vehicleMemory(array $arguments, array $result): array
    {
        $plate = $this->stringValue($result['plate'] ?? $arguments['plate'] ?? null);
        $brand = $this->stringValue($result['brand'] ?? $arguments['brand'] ?? null);
        $model = $this->stringValue($result['model'] ?? $arguments['model'] ?? null);
        $status = $this->stringValue($result['status'] ?? $arguments['status'] ?? null);

        $summary = 'Vehiculo creado';
        if ($plate) {
            $summary .= " {$plate}";
        }
        if ($brand || $model) {
            $summary .= ' (' . trim(($brand ?? '') . ' ' . ($model ?? '')) . ')';
        }

        $data = $this->filterData([
            'plate' => $plate,
            'brand' => $brand,
            'model' => $model,
            'status' => $status,
            'year' => $arguments['year'] ?? null,
            'color' => $this->stringValue($arguments['color'] ?? null),
            'vin' => $this->stringValue($arguments['vin'] ?? null),
            'current_mileage' => $arguments['current_mileage'] ?? null,
            'vehicle_type' => $this->stringValue($arguments['vehicle_type'] ?? null),
            'fuel_type' => $this->stringValue($arguments['fuel_type'] ?? null),
            'assigned_driver' => $this->stringValue($arguments['assigned_driver'] ?? null),
        ]);

        $searchText = $this->buildSearchText([
            $plate,
            $brand,
            $model,
            $data['vin'] ?? null,
            $data['assigned_driver'] ?? null,
            $data['vehicle_type'] ?? null,
        ]);

        return [
            'entity_type' => 'vehicle',
            'entity_id' => $result['id'] ?? null,
            'summary' => $this->limitSummary($summary),
            'search_text' => $searchText,
            'data' => $data,
            'importance' => 4,
        ];
    }

    protected function maintenanceOrderMemory(array $arguments, array $result, string $mode): array
    {
        $orderNumber = $this->stringValue($result['order_number'] ?? $arguments['order_number'] ?? null);
        $status = $this->stringValue($result['status'] ?? $arguments['status'] ?? null);
        $priority = $this->stringValue($result['priority'] ?? $arguments['priority'] ?? null);
        $vehicleId = $result['vehicle_id'] ?? $arguments['vehicle_id'] ?? null;
        $title = $this->stringValue($arguments['title'] ?? null);
        $taskSummary = $this->summarizeTasks($arguments['tasks'] ?? null);

        $orderLabel = $orderNumber ? " {$orderNumber}" : '';
        $summary = $mode === 'created'
            ? "Orden de mantenimiento{$orderLabel} creada"
            : "Orden de mantenimiento{$orderLabel} actualizada";

        if ($vehicleId) {
            $summary .= " para vehiculo {$vehicleId}";
        }
        if ($title) {
            $summary .= " ({$title})";
        }

        $data = $this->filterData([
            'order_number' => $orderNumber,
            'status' => $status,
            'priority' => $priority,
            'vehicle_id' => $vehicleId,
            'scheduled_date' => $result['scheduled_date'] ?? $arguments['scheduled_date'] ?? null,
            'completion_date' => $result['completion_date'] ?? $arguments['completion_date'] ?? null,
            'completion_mileage' => $arguments['completion_mileage'] ?? null,
            'estimated_cost' => $arguments['estimated_cost'] ?? null,
            'actual_cost' => $arguments['actual_cost'] ?? null,
            'title' => $title,
            'description' => $this->stringValue($arguments['description'] ?? null),
            'mechanic' => $this->stringValue($arguments['mechanic'] ?? null),
            'tasks_summary' => $taskSummary,
            'tasks_count' => is_array($arguments['tasks'] ?? null) ? count($arguments['tasks']) : null,
        ]);

        $searchText = $this->buildSearchText([
            $orderNumber,
            $status,
            $priority,
            $title,
            $taskSummary,
            $vehicleId ? (string) $vehicleId : null,
        ]);

        return [
            'entity_type' => 'maintenance_order',
            'entity_id' => $result['id'] ?? $arguments['order_id'] ?? null,
            'summary' => $this->limitSummary($summary),
            'search_text' => $searchText,
            'data' => $data,
            'importance' => 4,
        ];
    }

    protected function purchaseOrderMemory(array $arguments, array $result): array
    {
        $orderNumber = $this->stringValue($result['order_number'] ?? $arguments['order_number'] ?? null);
        $supplier = $this->stringValue($result['supplier'] ?? $arguments['supplier'] ?? null);
        $status = $this->stringValue($result['status'] ?? $arguments['status'] ?? null);
        $priority = $this->stringValue($result['priority'] ?? $arguments['priority'] ?? null);
        $productName = $this->stringValue($arguments['product_name'] ?? null);

        $orderLabel = $orderNumber ? " {$orderNumber}" : '';
        $summary = "Orden de compra{$orderLabel} creada";
        if ($supplier) {
            $summary .= " para {$supplier}";
        }

        $data = $this->filterData([
            'order_number' => $orderNumber,
            'supplier' => $supplier,
            'status' => $status,
            'priority' => $priority,
            'total_cost' => $arguments['total_cost'] ?? $result['total_cost'] ?? null,
            'expected_date' => $result['expected_date'] ?? $arguments['expected_date'] ?? null,
            'items_count' => $arguments['items_count'] ?? null,
            'spare_part_id' => $arguments['spare_part_id'] ?? null,
            'product_name' => $productName,
        ]);

        $searchText = $this->buildSearchText([
            $orderNumber,
            $supplier,
            $productName,
            $status,
            $priority,
        ]);

        return [
            'entity_type' => 'purchase_order',
            'entity_id' => $result['id'] ?? null,
            'summary' => $this->limitSummary($summary),
            'search_text' => $searchText,
            'data' => $data,
            'importance' => 4,
        ];
    }

    protected function sparePartStockMemory(array $arguments, array $result): array
    {
        $sku = $this->stringValue($result['sku'] ?? $arguments['sku'] ?? null);
        $currentStock = $result['current_stock'] ?? $arguments['current_stock'] ?? null;

        $summary = $sku
            ? "Stock actualizado para {$sku}"
            : 'Stock de repuesto actualizado';

        if ($currentStock !== null) {
            $summary .= " (actual: {$currentStock})";
        }

        $data = $this->filterData([
            'sku' => $sku,
            'current_stock' => $currentStock,
            'minimum_stock' => $result['minimum_stock'] ?? $arguments['minimum_stock'] ?? null,
            'maximum_stock' => $result['maximum_stock'] ?? $arguments['maximum_stock'] ?? null,
            'status' => $result['status'] ?? $arguments['status'] ?? null,
            'unit_cost' => $arguments['unit_cost'] ?? null,
            'delta' => $arguments['delta'] ?? null,
        ]);

        $searchText = $this->buildSearchText([
            $sku,
            $data['status'] ?? null,
        ]);

        return [
            'entity_type' => 'spare_part',
            'entity_id' => $result['id'] ?? $arguments['part_id'] ?? null,
            'summary' => $this->limitSummary($summary),
            'search_text' => $searchText,
            'data' => $data,
            'importance' => 3,
        ];
    }

    protected function alertMemory(array $arguments, array $result): array
    {
        $title = $this->stringValue($result['title'] ?? $arguments['title'] ?? null);
        $severity = $this->stringValue($result['severity'] ?? $arguments['severity'] ?? null);
        $type = $this->stringValue($result['type'] ?? $arguments['type'] ?? null);

        $summary = $title ? "Alerta creada: {$title}" : 'Alerta creada';
        if ($severity) {
            $summary .= " ({$severity})";
        }

        $data = $this->filterData([
            'title' => $title,
            'type' => $type,
            'severity' => $severity,
            'status' => $result['status'] ?? $arguments['status'] ?? null,
            'related_type' => $arguments['related_type'] ?? null,
            'related_id' => $arguments['related_id'] ?? null,
        ]);

        $searchText = $this->buildSearchText([
            $title,
            $type,
            $severity,
        ]);

        return [
            'entity_type' => 'alert',
            'entity_id' => $result['id'] ?? null,
            'summary' => $this->limitSummary($summary),
            'search_text' => $searchText,
            'data' => $data,
            'importance' => 2,
        ];
    }

    protected function summarizeTasks($tasks): ?string
    {
        if (!is_array($tasks)) {
            return null;
        }

        $labels = [];
        foreach ($tasks as $task) {
            if (!is_array($task)) {
                continue;
            }
            $category = $this->stringValue($task['category'] ?? null);
            $description = $this->stringValue($task['description'] ?? null);

            if (!$description) {
                continue;
            }

            $labels[] = $category ? "{$category}: {$description}" : $description;

            if (count($labels) >= 5) {
                break;
            }
        }

        return $labels === [] ? null : implode(' | ', $labels);
    }

    protected function buildSearchText(array $parts): ?string
    {
        $clean = [];

        foreach ($parts as $part) {
            $value = $this->stringValue($part);
            if ($value) {
                $clean[] = $value;
            }
        }

        if ($clean === []) {
            return null;
        }

        return implode(' ', array_values(array_unique($clean)));
    }

    protected function stringValue($value): ?string
    {
        if (is_string($value)) {
            $trimmed = trim($value);
            return $trimmed === '' ? null : $trimmed;
        }

        if (is_numeric($value)) {
            return (string) $value;
        }

        return null;
    }

    protected function filterData(array $data): array
    {
        return array_filter($data, fn ($value) => $value !== null && $value !== '');
    }

    protected function limitSummary(string $summary): string
    {
        $summary = trim($summary);
        if (strlen($summary) <= 255) {
            return $summary;
        }

        return substr($summary, 0, 252) . '...';
    }
}
