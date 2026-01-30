<?php

namespace App\Actions\TireTypes;

use App\Models\TireType;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Support\Arr;

class UpdateTireType
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function handle(User $user, TireType $type, array $data): TireType
    {
        $before = $this->auditLogger->snapshot($type);
        $payload = $this->normalize($data);
        unset($payload['company_id'], $payload['user_id']);

        $type->update($payload);

        $this->auditLogger->record(
            $user,
            'tire_type.updated',
            $type,
            $before,
            $this->auditLogger->snapshot($type->refresh())
        );

        return $type;
    }

    private function normalize(array $data): array
    {
        $payload = Arr::only($data, [
            'name',
            'brand',
            'model',
            'size',
            'usage',
            'pressure_target_psi',
            'pressure_tolerance_pct',
            'notes',
        ]);

        foreach (['name', 'brand', 'model', 'size'] as $key) {
            if (array_key_exists($key, $payload) && is_string($payload[$key])) {
                $value = trim($payload[$key]);
                $payload[$key] = $value === '' ? null : $value;
            }
        }

        return $payload;
    }
}
