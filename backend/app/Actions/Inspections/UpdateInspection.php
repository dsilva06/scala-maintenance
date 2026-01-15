<?php

namespace App\Actions\Inspections;

use App\Models\User;
use App\Models\Inspection;
use App\Services\AuditLogger;

class UpdateInspection
{
    public function __construct(
        private InspectionSideEffects $sideEffects,
        private AuditLogger $auditLogger
    )
    {
    }

    public function handle(User $user, Inspection $inspection, array $data): Inspection
    {
        $before = $this->auditLogger->snapshot($inspection);
        $payload = $data;
        unset($payload['company_id'], $payload['user_id']);
        $inspection->update($payload);

        $this->sideEffects->handle($inspection);

        $this->auditLogger->record(
            $user,
            'inspection.updated',
            $inspection,
            $before,
            $this->auditLogger->snapshot($inspection->refresh())
        );

        return $inspection;
    }
}
