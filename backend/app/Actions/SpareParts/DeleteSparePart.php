<?php

namespace App\Actions\SpareParts;

use App\Models\User;
use App\Models\SparePart;
use App\Services\AuditLogger;

class DeleteSparePart
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function handle(User $user, SparePart $sparePart): void
    {
        $before = $this->auditLogger->snapshot($sparePart);
        $sparePart->delete();

        $this->auditLogger->record($user, 'spare_part.deleted', $sparePart, $before, []);
    }
}
