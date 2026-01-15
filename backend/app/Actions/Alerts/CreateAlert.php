<?php

namespace App\Actions\Alerts;

use App\Jobs\ProcessAlertJob;
use App\Models\Alert;
use App\Models\User;
use App\Services\AuditLogger;

class CreateAlert
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function handle(User $user, array $data): Alert
    {
        $payload = $data;
        $payload['company_id'] = $user->company_id;

        $alert = $user->alerts()->create($payload);

        $this->auditLogger->record(
            $user,
            'alert.created',
            $alert,
            [],
            $this->auditLogger->snapshot($alert)
        );

        ProcessAlertJob::dispatch($alert->id)->afterCommit();

        return $alert;
    }
}
