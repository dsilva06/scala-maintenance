<?php

namespace App\Actions\Tires;

use App\Models\Tire;
use App\Models\User;
use App\Services\AuditLogger;

class DeleteTire
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function handle(User $user, Tire $tire): void
    {
        $before = $this->auditLogger->snapshot($tire);
        $tire->delete();

        $this->auditLogger->record(
            $user,
            'tire.deleted',
            $tire,
            $before,
            []
        );
    }
}
