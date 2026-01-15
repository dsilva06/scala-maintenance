<?php

namespace App\Actions\Vehicles;

use App\Models\User;
use App\Models\Vehicle;
use App\Services\AuditLogger;

class DeleteVehicle
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function handle(User $user, Vehicle $vehicle): void
    {
        $before = $this->auditLogger->snapshot($vehicle);
        $vehicle->delete();

        $this->auditLogger->record($user, 'vehicle.deleted', $vehicle, $before, []);
    }
}
