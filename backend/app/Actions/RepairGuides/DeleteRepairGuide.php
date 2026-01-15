<?php

namespace App\Actions\RepairGuides;

use App\Models\User;
use App\Models\RepairGuide;
use App\Services\AuditLogger;

class DeleteRepairGuide
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function handle(User $user, RepairGuide $repairGuide): void
    {
        $before = $this->auditLogger->snapshot($repairGuide);
        $repairGuide->delete();

        $this->auditLogger->record($user, 'repair_guide.deleted', $repairGuide, $before, []);
    }
}
