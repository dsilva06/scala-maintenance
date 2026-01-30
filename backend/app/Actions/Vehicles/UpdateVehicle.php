<?php

namespace App\Actions\Vehicles;

use App\Models\User;
use App\Models\Vehicle;
use App\Services\AuditLogger;

class UpdateVehicle
{
    public function __construct(
        private NormalizeVehiclePayload $normalizer,
        private SyncVehicleTirePositions $tirePositions,
        private AuditLogger $auditLogger
    )
    {
    }

    public function handle(User $user, Vehicle $vehicle, array $data): Vehicle
    {
        $before = $this->auditLogger->snapshot($vehicle);
        $payload = $this->normalizer->handle($data);
        $positions = $payload['tire_positions'] ?? null;
        $resetPositions = (bool) ($payload['tire_positions_reset'] ?? false);
        unset($payload['company_id'], $payload['user_id']);
        unset($payload['tire_positions'], $payload['tire_positions_reset']);
        $vehicle->update($payload);
        $this->tirePositions->handle($vehicle, $positions, $resetPositions);

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
