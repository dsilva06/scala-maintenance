<?php

namespace App\Actions\Trips;

use App\Jobs\RecomputeTripEtaJob;
use App\Models\User;
use App\Models\Trip;
use App\Services\AuditLogger;

class UpdateTrip
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function handle(User $user, Trip $trip, array $data): Trip
    {
        $before = $this->auditLogger->snapshot($trip);
        $payload = $data;
        unset($payload['company_id'], $payload['user_id']);
        $trip->update($payload);

        $this->auditLogger->record(
            $user,
            'trip.updated',
            $trip,
            $before,
            $this->auditLogger->snapshot($trip->refresh())
        );

        RecomputeTripEtaJob::dispatch($trip->id)->afterCommit();

        return $trip;
    }
}
