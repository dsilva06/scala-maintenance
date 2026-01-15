<?php

namespace App\Actions\Alerts;

use App\Models\User;
use App\Models\Alert;
use App\Services\AuditLogger;

class UpdateAlert
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function handle(User $user, Alert $alert, array $data): Alert
    {
        $before = $this->auditLogger->snapshot($alert);
        $payload = $data;
        unset($payload['company_id'], $payload['user_id']);
        $alert->update($payload);

        $this->auditLogger->record(
            $user,
            'alert.updated',
            $alert,
            $before,
            $this->auditLogger->snapshot($alert->refresh())
        );

        return $alert;
    }
}
