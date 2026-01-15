<?php

namespace App\Actions\Inspections;

use App\Models\User;
use App\Models\Inspection;
use App\Services\AuditLogger;

class DeleteInspection
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function handle(User $user, Inspection $inspection): void
    {
        $before = $this->auditLogger->snapshot($inspection);
        $inspection->delete();

        $this->auditLogger->record($user, 'inspection.deleted', $inspection, $before, []);
    }
}
