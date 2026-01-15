<?php

namespace App\Actions\Suppliers;

use App\Models\Supplier;
use App\Models\User;
use App\Services\AuditLogger;

class CreateSupplier
{
    public function __construct(
        private NormalizeSupplierPayload $normalizer,
        private AuditLogger $auditLogger
    )
    {
    }

    public function handle(User $user, array $data): Supplier
    {
        $payload = $this->normalizer->handle($data);
        $payload['company_id'] = $user->company_id;

        $supplier = $user->suppliers()->create($payload);

        $this->auditLogger->record(
            $user,
            'supplier.created',
            $supplier,
            [],
            $this->auditLogger->snapshot($supplier)
        );

        return $supplier;
    }
}
