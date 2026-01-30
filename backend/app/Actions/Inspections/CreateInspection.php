<?php

namespace App\Actions\Inspections;

use App\Models\Inspection;
use App\Models\User;
use App\Services\AuditLogger;

class CreateInspection
{
    public function __construct(
        private InspectionSideEffects $sideEffects,
        private TireInspectionHandler $tireHandler,
        private AuditLogger $auditLogger
    )
    {
    }

    public function handle(User $user, array $data): Inspection
    {
        $payload = $data;
        $tireChecks = $payload['tire_checks'] ?? null;
        unset($payload['tire_checks']);
        $payload['company_id'] = $user->company_id;

        $inspection = $user->inspections()->create($payload);

        $this->tireHandler->sync($user, $inspection, is_array($tireChecks) ? $tireChecks : null);
        $this->sideEffects->handle($inspection);

        $this->auditLogger->record(
            $user,
            'inspection.created',
            $inspection,
            [],
            $this->auditLogger->snapshot($inspection)
        );

        return $inspection;
    }
}
