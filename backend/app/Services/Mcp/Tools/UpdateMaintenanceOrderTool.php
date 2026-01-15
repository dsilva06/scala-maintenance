<?php

namespace App\Services\Mcp\Tools;

use App\Models\MaintenanceOrder;
use App\Models\User;
use App\Models\Vehicle;
use App\Services\AuditLogger;
use App\Services\Mcp\Contracts\ToolInterface;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class UpdateMaintenanceOrderTool implements ToolInterface
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function getName(): string
    {
        return 'update_maintenance_order';
    }

    public function getDescription(): string
    {
        return 'Actualiza una orden de mantenimiento por order_id o order_number.';
    }

    public function getInputSchema(): array
    {
        return [
            'type' => 'object',
            'required' => [],
            'properties' => [
                'order_id' => ['type' => 'integer'],
                'order_number' => ['type' => 'string'],
                'status' => ['type' => 'string'],
                'priority' => ['type' => 'string'],
                'scheduled_date' => ['type' => 'string', 'format' => 'date-time'],
                'completion_date' => ['type' => 'string', 'format' => 'date-time'],
                'completion_mileage' => ['type' => 'integer'],
                'estimated_cost' => ['type' => 'number'],
                'actual_cost' => ['type' => 'number'],
                'title' => ['type' => 'string'],
                'description' => ['type' => 'string'],
                'mechanic' => ['type' => 'string'],
                'notes' => ['type' => 'string'],
                'tasks' => ['type' => 'array', 'items' => ['type' => 'object']],
                'parts' => ['type' => 'array', 'items' => ['type' => 'object']],
            ],
        ];
    }

    public function validateArguments(array $arguments, User $user): array
    {
        if (!$user->canManageCompany()) {
            throw ValidationException::withMessages([
                'role' => ['No tienes permisos para actualizar ordenes.'],
            ]);
        }

        $validator = Validator::make($arguments, [
            'order_id' => ['nullable', 'integer'],
            'order_number' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'string', 'max:50'],
            'priority' => ['nullable', 'string', 'max:50'],
            'scheduled_date' => ['nullable', 'date'],
            'completion_date' => ['nullable', 'date'],
            'completion_mileage' => ['nullable', 'integer', 'min:0'],
            'estimated_cost' => ['nullable', 'numeric', 'min:0'],
            'actual_cost' => ['nullable', 'numeric', 'min:0'],
            'title' => ['nullable', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'mechanic' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string'],
            'tasks' => ['nullable', 'array'],
            'parts' => ['nullable', 'array'],
        ]);

        $validator->after(function ($validator) use ($arguments) {
            if (empty($arguments['order_id']) && empty($arguments['order_number'])) {
                $validator->errors()->add('order', 'Se requiere order_id o order_number.');
            }

            $updateFields = [
                'status', 'priority', 'scheduled_date', 'completion_date',
                'completion_mileage', 'estimated_cost', 'actual_cost', 'title', 'description',
                'mechanic', 'notes', 'tasks', 'parts',
            ];

            $hasUpdate = false;
            foreach ($updateFields as $field) {
                if (array_key_exists($field, $arguments)) {
                    $value = $arguments[$field];
                    if ($value !== null && $value !== '') {
                        $hasUpdate = true;
                        break;
                    }
                }
            }

            if (!$hasUpdate) {
                $validator->errors()->add('updates', 'Se requiere al menos un campo para actualizar.');
            }
        });

        $validated = $validator->validate();

        if (!empty($validated['order_number'])) {
            $validated['order_number'] = strtoupper(trim($validated['order_number']));
        }

        foreach (['status', 'priority', 'title', 'description', 'mechanic', 'notes'] as $key) {
            if (array_key_exists($key, $validated) && is_string($validated[$key])) {
                $validated[$key] = trim($validated[$key]);
            }
        }

        return $validated;
    }

    public function invoke(array $arguments, User $user): array
    {
        $validated = $this->validateArguments($arguments, $user);

        $order = $this->resolveOrder($validated, $user->company_id);

        $updates = $validated;
        unset($updates['order_id'], $updates['order_number']);

        $before = $this->auditLogger->snapshot($order);
        $order->update($updates);

        if ($order->vehicle_id) {
            $this->refreshVehicleStatus($order->vehicle_id, $user->company_id);
            $this->syncVehicleMileageFromOrder($order, $updates);
        }

        $this->auditLogger->record(
            $user,
            'maintenance_order.updated',
            $order,
            $before,
            $this->auditLogger->snapshot($order->refresh()),
            ['source' => 'mcp']
        );

        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status,
            'priority' => $order->priority,
            'scheduled_date' => optional($order->scheduled_date)->toIso8601String(),
            'completion_date' => optional($order->completion_date)->toIso8601String(),
        ];
    }

    protected function resolveOrder(array $validated, int $companyId): MaintenanceOrder
    {
        $query = MaintenanceOrder::query()->where('company_id', $companyId);

        if (!empty($validated['order_id'])) {
            $query->where('id', $validated['order_id']);
        } else {
            $query->where('order_number', $validated['order_number']);
        }

        $order = $query->first();

        if (!$order) {
            throw ValidationException::withMessages([
                'order' => ['No se encontro la orden indicada.'],
            ]);
        }

        return $order;
    }

    protected function refreshVehicleStatus(int $vehicleId, int $companyId): void
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

    protected function syncVehicleMileageFromOrder(MaintenanceOrder $order, array $updates): void
    {
        if (($updates['status'] ?? $order->status) !== 'completada') {
            return;
        }

        if (! array_key_exists('completion_mileage', $updates) && $order->completion_mileage === null) {
            return;
        }

        $completionMileage = $updates['completion_mileage'] ?? $order->completion_mileage;
        if ($completionMileage === null) {
            return;
        }

        $vehicle = Vehicle::where('id', $order->vehicle_id)
            ->where('company_id', $order->company_id)
            ->first();

        if (! $vehicle) {
            return;
        }

        $currentMileage = (int) ($vehicle->current_mileage ?? 0);
        $newMileage = max($currentMileage, (int) $completionMileage);

        $updatesVehicle = ['current_mileage' => $newMileage];

        $completionDate = $updates['completion_date'] ?? $order->completion_date;
        if ($completionDate) {
            $updatesVehicle['last_service_date'] = $completionDate instanceof \DateTimeInterface
                ? $completionDate->format('Y-m-d')
                : (string) $completionDate;
        }

        $vehicle->update($updatesVehicle);
    }
}
