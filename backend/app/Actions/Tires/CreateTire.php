<?php

namespace App\Actions\Tires;

use App\Models\Tire;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Support\Arr;

class CreateTire
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function handle(User $user, array $data): Tire
    {
        $payload = $this->normalize($data);
        $payload['company_id'] = $user->company_id;
        $payload['user_id'] = $user->id;

        $tire = Tire::create($payload);

        $this->auditLogger->record(
            $user,
            'tire.created',
            $tire,
            [],
            $this->auditLogger->snapshot($tire)
        );

        return $tire;
    }

    private function normalize(array $data): array
    {
        $payload = Arr::only($data, [
            'tire_type_id',
            'serial',
            'purchase_date',
            'purchase_cost',
            'depth_new_mm',
            'min_depth_mm',
            'status',
            'notes',
        ]);

        foreach (['serial', 'status'] as $key) {
            if (array_key_exists($key, $payload) && is_string($payload[$key])) {
                $value = trim($payload[$key]);
                $payload[$key] = $value === '' ? null : $value;
            }
        }

        return $payload;
    }
}
