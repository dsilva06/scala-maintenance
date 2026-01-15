<?php

namespace App\Actions\Inspections;

use App\Models\Inspection;
use App\Models\User;
use App\Services\AuditLogger;

class CreateInspection
{
    public function __construct(
        private InspectionSideEffects $sideEffects,
        private AuditLogger $auditLogger
    )
    {
    }

    public function handle(User $user, array $data): Inspection
    {
        $payload = $data;
        $payload['company_id'] = $user->company_id;

        $inspection = $user->inspections()->create($payload);

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
