<?php

namespace App\Actions\Suppliers;

use App\Models\User;
use App\Models\Supplier;
use App\Services\AuditLogger;

class UpdateSupplier
{
    public function __construct(
        private NormalizeSupplierPayload $normalizer,
        private AuditLogger $auditLogger
    )
    {
    }

    public function handle(User $user, Supplier $supplier, array $data): Supplier
    {
        $before = $this->auditLogger->snapshot($supplier);
        $payload = $this->normalizer->handle($data);
        unset($payload['company_id'], $payload['user_id']);
        $supplier->update($payload);

        $this->auditLogger->record(
            $user,
            'supplier.updated',
            $supplier,
            $before,
            $this->auditLogger->snapshot($supplier->refresh())
        );

        return $supplier;
    }
}
