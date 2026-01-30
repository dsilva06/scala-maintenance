<?php

namespace App\Actions\Tires;

use App\Models\Tire;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Support\Arr;

class UpdateTire
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function handle(User $user, Tire $tire, array $data): Tire
    {
        $before = $this->auditLogger->snapshot($tire);
        $payload = $this->normalize($data);
        unset($payload['company_id'], $payload['user_id']);

        $tire->update($payload);

        $this->auditLogger->record(
            $user,
            'tire.updated',
            $tire,
            $before,
            $this->auditLogger->snapshot($tire->refresh())
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
