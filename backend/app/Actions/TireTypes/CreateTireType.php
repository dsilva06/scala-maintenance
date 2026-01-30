<?php

namespace App\Actions\TireTypes;

use App\Models\TireType;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Support\Arr;

class CreateTireType
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function handle(User $user, array $data): TireType
    {
        $payload = $this->normalize($data);
        $payload['company_id'] = $user->company_id;
        $payload['user_id'] = $user->id;

        $type = TireType::create($payload);

        $this->auditLogger->record(
            $user,
            'tire_type.created',
            $type,
            [],
            $this->auditLogger->snapshot($type)
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

        if (empty($payload['usage'])) {
            $payload['usage'] = 'traction';
        }

        return $payload;
    }
}
