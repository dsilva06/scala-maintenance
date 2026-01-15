<?php

namespace App\Actions\Vehicles;

use App\Models\User;
use App\Models\Vehicle;
use App\Services\AuditLogger;

class UpdateVehicle
{
    public function __construct(
        private NormalizeVehiclePayload $normalizer,
        private AuditLogger $auditLogger
    )
    {
    }

    public function handle(User $user, Vehicle $vehicle, array $data): Vehicle
    {
        $before = $this->auditLogger->snapshot($vehicle);
        $payload = $this->normalizer->handle($data);
        unset($payload['company_id'], $payload['user_id']);
        $vehicle->update($payload);

        $this->auditLogger->record(
            $user,
            'vehicle.updated',
            $vehicle,
            $before,
            $this->auditLogger->snapshot($vehicle->refresh())
        );

        return $vehicle;
    }
}
