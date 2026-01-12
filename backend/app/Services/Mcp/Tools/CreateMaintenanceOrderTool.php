<?php

namespace App\Services\Mcp\Tools;

use App\Models\MaintenanceOrder;
use App\Models\User;
use App\Models\Vehicle;
use App\Services\Mcp\Contracts\ToolInterface;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CreateMaintenanceOrderTool implements ToolInterface
{
    public function getName(): string
    {
        return 'create_maintenance_order';
    }

    public function getDescription(): string
    {
        return 'Crea una orden de mantenimiento. Requiere order_number y vehiculo (vehicle_id o vehicle_plate).';
    }

    public function getInputSchema(): array
    {
        return [
            'type' => 'object',
            'required' => ['order_number'],
            'properties' => [
                'order_number' => ['type' => 'string'],
                'vehicle_id' => ['type' => 'integer'],
                'vehicle_plate' => ['type' => 'string'],
                'type' => ['type' => 'string'],
                'status' => ['type' => 'string'],
                'priority' => ['type' => 'string'],
                'title' => ['type' => 'string'],
                'description' => ['type' => 'string'],
                'mechanic' => ['type' => 'string'],
                'scheduled_date' => ['type' => 'string', 'format' => 'date-time'],
                'completion_date' => ['type' => 'string', 'format' => 'date-time'],
                'completion_mileage' => ['type' => 'integer'],
                'estimated_cost' => ['type' => 'number'],
                'notes' => ['type' => 'string'],
                'tasks' => ['type' => 'array', 'items' => ['type' => 'object']],
                'parts' => ['type' => 'array', 'items' => ['type' => 'object']],
            ],
        ];
    }

    public function validateArguments(array $arguments, User $user): array
    {
        $validator = Validator::make($arguments, [
            'vehicle_id' => ['nullable', 'integer', 'exists:vehicles,id'],
            'vehicle_plate' => ['nullable', 'string', 'max:50'],
            'order_number' => [
                'required',
                'string',
                'max:120',
                Rule::unique('maintenance_orders', 'order_number')->where('user_id', $user->id),
            ],
            'type' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'string', 'max:50'],
            'priority' => ['nullable', 'string', 'max:50'],
            'title' => ['nullable', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'mechanic' => ['nullable', 'string', 'max:120'],
            'scheduled_date' => ['nullable', 'date'],
            'completion_date' => ['nullable', 'date'],
            'completion_mileage' => ['nullable', 'integer', 'min:0'],
            'estimated_cost' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'tasks' => ['nullable', 'array'],
            'parts' => ['nullable', 'array'],
        ]);

        $validator->after(function ($validator) use ($arguments) {
            if (empty($arguments['vehicle_id']) && empty($arguments['vehicle_plate'])) {
                $validator->errors()->add('vehicle', 'Se requiere vehicle_id o vehicle_plate.');
            }
            if (empty($arguments['title']) && empty($arguments['description'])) {
                $validator->errors()->add('title', 'Se requiere title o description.');
            }
        });

        $validated = $validator->validate();

        if (!empty($validated['vehicle_id'])) {
            $this->ensureVehicleOwnership($validated['vehicle_id'], $user->id);
        } elseif (!empty($validated['vehicle_plate'])) {
            $vehicleId = $this->resolveVehicleByPlate($validated['vehicle_plate'], $user->id);
            $validated['vehicle_id'] = $vehicleId;
            unset($validated['vehicle_plate']);
        }

        $validated['order_number'] = strtoupper(trim($validated['order_number']));

        foreach (['type', 'status', 'priority', 'title', 'description', 'mechanic', 'notes'] as $key) {
            if (array_key_exists($key, $validated) && is_string($validated[$key])) {
                $validated[$key] = trim($validated[$key]);
            }
        }

        return $validated;
    }

    public function invoke(array $arguments, User $user): array
    {
        $validated = $this->validateArguments($arguments, $user);

        $order = $user->maintenanceOrders()->create($validated);

        if ($order->vehicle_id) {
            $this->refreshVehicleStatus($order->vehicle_id, $user->id);
            $this->syncVehicleMileageFromOrder($order);
        }

        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status,
            'priority' => $order->priority,
            'vehicle_id' => $order->vehicle_id,
            'scheduled_date' => optional($order->scheduled_date)->toIso8601String(),
        ];
    }

    protected function ensureVehicleOwnership(int $vehicleId, int $userId): void
    {
        $ownsVehicle = Vehicle::whereKey($vehicleId)
            ->where('user_id', $userId)
            ->exists();

        if (!$ownsVehicle) {
            throw ValidationException::withMessages([
                'vehicle_id' => ['El vehiculo seleccionado no pertenece al usuario autenticado.'],
            ]);
        }
    }

    protected function resolveVehicleByPlate(string $plate, int $userId): int
    {
        $vehicle = Vehicle::query()
            ->where('user_id', $userId)
            ->whereRaw('lower(plate) = ?', [strtolower($plate)])
            ->first();

        if (!$vehicle) {
            throw ValidationException::withMessages([
                'vehicle_plate' => ['No se encontro un vehiculo con esa placa.'],
            ]);
        }

        return $vehicle->id;
    }

    protected function refreshVehicleStatus(int $vehicleId, int $userId): void
    {
        $openStatuses = ['pendiente', 'en_progreso'];

        $hasOpenOrders = MaintenanceOrder::where('vehicle_id', $vehicleId)
            ->where('user_id', $userId)
            ->whereIn('status', $openStatuses)
            ->exists();

        $newStatus = $hasOpenOrders ? 'mantenimiento' : 'activo';

        Vehicle::where('id', $vehicleId)
            ->where('user_id', $userId)
            ->update(['status' => $newStatus]);
    }

    protected function syncVehicleMileageFromOrder(MaintenanceOrder $order): void
    {
        if ($order->status !== 'completada') {
            return;
        }

        if ($order->completion_mileage === null) {
            return;
        }

        $vehicle = Vehicle::where('id', $order->vehicle_id)
            ->where('user_id', $order->user_id)
            ->first();

        if (! $vehicle) {
            return;
        }

        $currentMileage = (int) ($vehicle->current_mileage ?? 0);
        $newMileage = max($currentMileage, (int) $order->completion_mileage);

        $updates = ['current_mileage' => $newMileage];

        if ($order->completion_date) {
            $updates['last_service_date'] = $order->completion_date->toDateString();
        }

        $vehicle->update($updates);
    }
}
