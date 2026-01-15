<?php

namespace App\Actions\Suppliers;

use App\Models\User;
use App\Models\Supplier;
use App\Services\AuditLogger;

class DeleteSupplier
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function handle(User $user, Supplier $supplier): void
    {
        $before = $this->auditLogger->snapshot($supplier);
        $supplier->delete();

        $this->auditLogger->record($user, 'supplier.deleted', $supplier, $before, []);
    }
}
