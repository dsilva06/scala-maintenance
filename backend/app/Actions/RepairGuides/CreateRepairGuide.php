<?php

namespace App\Actions\RepairGuides;

use App\Models\RepairGuide;
use App\Models\User;
use App\Services\AuditLogger;

class CreateRepairGuide
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function handle(User $user, array $data): RepairGuide
    {
        $payload = $data;
        $payload['company_id'] = $user->company_id;

        $guide = $user->repairGuides()->create($payload);

        $this->auditLogger->record(
            $user,
            'repair_guide.created',
            $guide,
            [],
            $this->auditLogger->snapshot($guide)
        );

        return $guide;
    }
}
