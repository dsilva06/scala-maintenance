<?php

namespace App\Actions\Vehicles;

use App\Services\AuditLogger;
use App\Models\User;
use App\Models\Vehicle;

class CreateVehicle
{
    public function __construct(
        private NormalizeVehiclePayload $normalizer,
        private SyncVehicleTirePositions $tirePositions,
        private AuditLogger $auditLogger
    )
    {
    }

    public function handle(User $user, array $data): Vehicle
    {
        $payload = $this->normalizer->handle($data);
        $positions = $payload['tire_positions'] ?? null;
        $resetPositions = (bool) ($payload['tire_positions_reset'] ?? false);
        unset($payload['tire_positions'], $payload['tire_positions_reset']);
        $payload['company_id'] = $user->company_id;

        $vehicle = $user->vehicles()->create($payload);
        $this->tirePositions->handle($vehicle, $positions, $resetPositions);

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
