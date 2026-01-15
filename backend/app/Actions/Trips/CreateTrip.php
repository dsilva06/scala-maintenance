<?php

namespace App\Actions\Trips;

use App\Jobs\RecomputeTripEtaJob;
use App\Models\Trip;
use App\Models\User;
use App\Services\AuditLogger;

class CreateTrip
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function handle(User $user, array $data): Trip
    {
        $payload = $data;
        $payload['company_id'] = $user->company_id;

        $trip = $user->trips()->create($payload);

        $this->auditLogger->record(
            $user,
            'trip.created',
            $trip,
            [],
            $this->auditLogger->snapshot($trip)
        );

        RecomputeTripEtaJob::dispatch($trip->id)->afterCommit();

        return $trip;
    }
}
