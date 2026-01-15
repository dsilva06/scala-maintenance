<?php

namespace App\Services\Mcp\Tools;

use App\Models\User;
use App\Models\Vehicle;
use App\Services\AuditLogger;
use App\Services\Mcp\Contracts\ToolInterface;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CreateVehicleTool implements ToolInterface
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function getName(): string
    {
        return 'create_vehicle';
    }

    public function getDescription(): string
    {
        return 'Crea un vehiculo con placa, marca y modelo.';
    }

    public function getInputSchema(): array
    {
        return [
            'type' => 'object',
            'required' => ['plate', 'brand', 'model'],
            'properties' => [
                'plate' => ['type' => 'string', 'description' => 'Placa del vehiculo.'],
                'brand' => ['type' => 'string', 'description' => 'Marca del vehiculo.'],
                'model' => ['type' => 'string', 'description' => 'Modelo del vehiculo.'],
                'year' => ['type' => 'integer', 'description' => 'Ano del vehiculo.'],
                'color' => ['type' => 'string', 'description' => 'Color del vehiculo.'],
                'vin' => ['type' => 'string', 'description' => 'VIN del vehiculo.'],
                'current_mileage' => ['type' => 'integer', 'description' => 'Kilometraje actual.'],
                'vehicle_type' => ['type' => 'string', 'description' => 'Tipo de vehiculo (carga, liviano, etc).'],
                'status' => ['type' => 'string', 'description' => 'Estado del vehiculo.'],
                'fuel_type' => ['type' => 'string', 'description' => 'Tipo de combustible.'],
                'last_service_date' => ['type' => 'string', 'format' => 'date', 'description' => 'Ultimo servicio.'],
                'next_service_date' => ['type' => 'string', 'format' => 'date', 'description' => 'Proximo servicio.'],
                'assigned_driver' => ['type' => 'string', 'description' => 'Conductor asignado.'],
            ],
        ];
    }

    public function validateArguments(array $arguments, User $user): array
    {
        if (!$user->canManageCompany()) {
            throw ValidationException::withMessages([
                'role' => ['No tienes permisos para crear vehiculos.'],
            ]);
        }

        $validator = Validator::make($arguments, [
            'plate' => [
                'required',
                'string',
                'max:120',
                Rule::unique('vehicles', 'plate')->where('company_id', $user->company_id),
            ],
            'brand' => ['required', 'string', 'max:120'],
            'model' => ['required', 'string', 'max:120'],
            'year' => ['nullable', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'color' => ['nullable', 'string', 'max:80'],
            'vin' => ['nullable', 'string', 'max:120'],
            'current_mileage' => ['nullable', 'integer', 'min:0'],
            'vehicle_type' => ['nullable', 'string', 'max:80'],
            'status' => ['nullable', 'string', 'max:80'],
            'fuel_type' => ['nullable', 'string', 'max:80'],
            'last_service_date' => ['nullable', 'date'],
            'next_service_date' => ['nullable', 'date'],
            'assigned_driver' => ['nullable', 'string', 'max:120'],
        ]);

        $validated = $validator->validate();

        foreach ([
            'plate', 'brand', 'model', 'color', 'vin', 'vehicle_type',
            'status', 'fuel_type', 'assigned_driver',
        ] as $key) {
            if (array_key_exists($key, $validated) && is_string($validated[$key])) {
                $validated[$key] = trim($validated[$key]);
            }
        }

        $validated['plate'] = strtoupper($validated['plate']);

        return $validated;
    }

    public function invoke(array $arguments, User $user): array
    {
        $validated = $this->validateArguments($arguments, $user);

        $payload = $validated;
        $payload['company_id'] = $user->company_id;

        $vehicle = $user->vehicles()->create($payload);

        $this->auditLogger->record(
            $user,
            'vehicle.created',
            $vehicle,
            [],
            $this->auditLogger->snapshot($vehicle),
            ['source' => 'mcp']
        );

        return [
            'id' => $vehicle->id,
            'plate' => $vehicle->plate,
            'brand' => $vehicle->brand,
            'model' => $vehicle->model,
            'status' => $vehicle->status,
        ];
    }
}
