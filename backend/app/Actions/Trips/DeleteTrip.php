<?php

namespace App\Actions\Trips;

use App\Models\User;
use App\Models\Trip;
use App\Services\AuditLogger;

class DeleteTrip
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function handle(User $user, Trip $trip): void
    {
        $before = $this->auditLogger->snapshot($trip);
        $trip->delete();

        $this->auditLogger->record($user, 'trip.deleted', $trip, $before, []);
    }
}
