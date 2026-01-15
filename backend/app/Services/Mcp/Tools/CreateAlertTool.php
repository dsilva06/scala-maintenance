<?php

namespace App\Services\Mcp\Tools;

use App\Models\Alert;
use App\Models\Document;
use App\Models\Inspection;
use App\Models\MaintenanceOrder;
use App\Models\PurchaseOrder;
use App\Models\SparePart;
use App\Models\Trip;
use App\Models\User;
use App\Models\Vehicle;
use App\Services\AuditLogger;
use App\Services\Mcp\Contracts\ToolInterface;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class CreateAlertTool implements ToolInterface
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function getName(): string
    {
        return 'create_alert';
    }

    public function getDescription(): string
    {
        return 'Crea una alerta para el usuario.';
    }

    public function getInputSchema(): array
    {
        return [
            'type' => 'object',
            'required' => ['type', 'title'],
            'properties' => [
                'type' => ['type' => 'string'],
                'severity' => ['type' => 'string'],
                'title' => ['type' => 'string'],
                'description' => ['type' => 'string'],
                'status' => ['type' => 'string'],
                'related_type' => ['type' => 'string'],
                'related_id' => ['type' => 'integer'],
            ],
        ];
    }

    public function validateArguments(array $arguments, User $user): array
    {
        if (!$user->canManageCompany()) {
            throw ValidationException::withMessages([
                'role' => ['No tienes permisos para crear alertas.'],
            ]);
        }

        $validator = Validator::make($arguments, [
            'type' => ['required', 'string', 'max:80'],
            'severity' => ['nullable', 'string', 'max:50'],
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'max:50'],
            'related_type' => ['nullable', 'string', 'max:80'],
            'related_id' => ['nullable', 'integer'],
        ]);

        $validator->after(function ($validator) use ($arguments) {
            if (!empty($arguments['related_type']) && empty($arguments['related_id'])) {
                $validator->errors()->add('related_id', 'Se requiere related_id cuando related_type esta presente.');
            }
        });

        $validated = $validator->validate();

        foreach (['type', 'severity', 'title', 'description', 'status', 'related_type'] as $key) {
            if (array_key_exists($key, $validated) && is_string($validated[$key])) {
                $validated[$key] = trim($validated[$key]);
            }
        }

        if (!empty($validated['related_type'])) {
            $validated['related_type'] = $this->resolveRelatedType($validated['related_type']);
            $this->ensureRelatedOwnership($validated['related_type'], $validated['related_id'], $user->company_id);
        }

        return $validated;
    }

    public function invoke(array $arguments, User $user): array
    {
        $validated = $this->validateArguments($arguments, $user);

        $payload = $validated;
        $payload['company_id'] = $user->company_id;

        $alert = $user->alerts()->create($payload);

        $this->auditLogger->record(
            $user,
            'alert.created',
            $alert,
            [],
            $this->auditLogger->snapshot($alert),
            ['source' => 'mcp']
        );

        return [
            'id' => $alert->id,
            'type' => $alert->type,
            'severity' => $alert->severity,
            'title' => $alert->title,
            'status' => $alert->status,
        ];
    }

    protected function resolveRelatedType(string $type): string
    {
        $map = [
            'vehicle' => Vehicle::class,
            'maintenance_order' => MaintenanceOrder::class,
            'spare_part' => SparePart::class,
            'purchase_order' => PurchaseOrder::class,
            'document' => Document::class,
            'inspection' => Inspection::class,
            'trip' => Trip::class,
        ];

        $normalized = strtolower($type);

        if (!isset($map[$normalized])) {
            throw ValidationException::withMessages([
                'related_type' => ['Tipo relacionado no soportado.'],
            ]);
        }

        return $map[$normalized];
    }

    protected function ensureRelatedOwnership(string $modelClass, int $id, int $companyId): void
    {
        $exists = $modelClass::query()
            ->where('id', $id)
            ->where('company_id', $companyId)
            ->exists();

        if (!$exists) {
            throw ValidationException::withMessages([
                'related_id' => ['El recurso relacionado no pertenece al usuario.'],
            ]);
        }
    }
}
