<?php

namespace App\Actions\Alerts;

use App\Models\User;
use App\Models\Alert;
use App\Services\AuditLogger;

class DeleteAlert
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function handle(User $user, Alert $alert): void
    {
        $before = $this->auditLogger->snapshot($alert);
        $alert->delete();

        $this->auditLogger->record($user, 'alert.deleted', $alert, $before, []);
    }
}
