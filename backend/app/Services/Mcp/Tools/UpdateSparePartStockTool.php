<?php

namespace App\Services\Mcp\Tools;

use App\Models\SparePart;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\Mcp\Contracts\ToolInterface;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class UpdateSparePartStockTool implements ToolInterface
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function getName(): string
    {
        return 'update_spare_part_stock';
    }

    public function getDescription(): string
    {
        return 'Actualiza stock de repuestos por sku o part_id.';
    }

    public function getInputSchema(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'part_id' => ['type' => 'integer'],
                'sku' => ['type' => 'string'],
                'current_stock' => ['type' => 'integer'],
                'delta' => ['type' => 'integer'],
                'minimum_stock' => ['type' => 'integer'],
                'maximum_stock' => ['type' => 'integer'],
                'status' => ['type' => 'string'],
                'unit_cost' => ['type' => 'number'],
            ],
        ];
    }

    public function validateArguments(array $arguments, User $user): array
    {
        if (!$user->canManageCompany()) {
            throw ValidationException::withMessages([
                'role' => ['No tienes permisos para actualizar repuestos.'],
            ]);
        }

        $validator = Validator::make($arguments, [
            'part_id' => ['nullable', 'integer'],
            'sku' => ['nullable', 'string', 'max:120'],
            'current_stock' => ['nullable', 'integer', 'min:0'],
            'delta' => ['nullable', 'integer'],
            'minimum_stock' => ['nullable', 'integer', 'min:0'],
            'maximum_stock' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', 'string', 'max:50'],
            'unit_cost' => ['nullable', 'numeric', 'min:0'],
        ]);

        $validator->after(function ($validator) use ($arguments) {
            if (empty($arguments['part_id']) && empty($arguments['sku'])) {
                $validator->errors()->add('part', 'Se requiere part_id o sku.');
            }
            if (!array_key_exists('current_stock', $arguments) && !array_key_exists('delta', $arguments)
                && !array_key_exists('minimum_stock', $arguments) && !array_key_exists('maximum_stock', $arguments)
                && !array_key_exists('status', $arguments) && !array_key_exists('unit_cost', $arguments)) {
                $validator->errors()->add('updates', 'Se requiere al menos un campo para actualizar.');
            }
        });

        $validated = $validator->validate();

        if (!empty($validated['sku'])) {
            $validated['sku'] = strtoupper(trim($validated['sku']));
        }

        return $validated;
    }

    public function invoke(array $arguments, User $user): array
    {
        $validated = $this->validateArguments($arguments, $user);

        $part = $this->resolvePart($validated, $user->company_id);

        $updates = $validated;
        unset($updates['part_id'], $updates['sku']);

        if (array_key_exists('delta', $updates)) {
            $updates['current_stock'] = max(0, $part->current_stock + $updates['delta']);
            unset($updates['delta']);
        }

        $before = $this->auditLogger->snapshot($part);
        $part->update($updates);

        $this->auditLogger->record(
            $user,
            'spare_part.updated',
            $part,
            $before,
            $this->auditLogger->snapshot($part->refresh()),
            ['source' => 'mcp']
        );

        return [
            'id' => $part->id,
            'sku' => $part->sku,
            'current_stock' => $part->current_stock,
            'minimum_stock' => $part->minimum_stock,
            'maximum_stock' => $part->maximum_stock,
            'status' => $part->status,
        ];
    }

    protected function resolvePart(array $validated, int $companyId): SparePart
    {
        $query = SparePart::query()->where('company_id', $companyId);

        if (!empty($validated['part_id'])) {
            $query->where('id', $validated['part_id']);
        } else {
            $query->where('sku', $validated['sku']);
        }

        $part = $query->first();

        if (!$part) {
            throw ValidationException::withMessages([
                'part' => ['No se encontro el repuesto indicado.'],
            ]);
        }

        return $part;
    }
}
