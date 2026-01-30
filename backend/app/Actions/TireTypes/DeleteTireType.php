<?php

namespace App\Actions\TireTypes;

use App\Models\TireType;
use App\Models\User;
use App\Services\AuditLogger;

class DeleteTireType
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function handle(User $user, TireType $type): void
    {
        $before = $this->auditLogger->snapshot($type);
        $type->delete();

        $this->auditLogger->record(
            $user,
            'tire_type.deleted',
            $type,
            $before,
            []
        );
    }
}
