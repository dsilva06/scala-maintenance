<?php

namespace App\Actions\RepairGuides;

use App\Models\User;
use App\Models\RepairGuide;
use App\Services\AuditLogger;

class UpdateRepairGuide
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function handle(User $user, RepairGuide $repairGuide, array $data): RepairGuide
    {
        $before = $this->auditLogger->snapshot($repairGuide);
        $payload = $data;
        unset($payload['company_id'], $payload['user_id']);
        $repairGuide->update($payload);

        $this->auditLogger->record(
            $user,
            'repair_guide.updated',
            $repairGuide,
            $before,
            $this->auditLogger->snapshot($repairGuide->refresh())
        );

        return $repairGuide;
    }
}
