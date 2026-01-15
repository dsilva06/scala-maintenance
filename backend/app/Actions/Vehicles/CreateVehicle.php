<?php

namespace App\Actions\Vehicles;

use App\Services\AuditLogger;
use App\Models\User;
use App\Models\Vehicle;

class CreateVehicle
{
    public function __construct(
        private NormalizeVehiclePayload $normalizer,
        private AuditLogger $auditLogger
    )
    {
    }

    public function handle(User $user, array $data): Vehicle
    {
        $payload = $this->normalizer->handle($data);
        $payload['company_id'] = $user->company_id;

        $vehicle = $user->vehicles()->create($payload);

        $this->auditLogger->record(
            $user,
            'vehicle.created',
            $vehicle,
            [],
            $this->auditLogger->snapshot($vehicle)
        );

        return $vehicle;
    }
}
