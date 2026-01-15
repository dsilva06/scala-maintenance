<?php

namespace App\Actions\SpareParts;

use App\Models\SparePart;
use App\Models\User;
use App\Services\AuditLogger;

class CreateSparePart
{
    public function __construct(
        private NormalizeSparePartPayload $normalizer,
        private AuditLogger $auditLogger
    )
    {
    }

    public function handle(User $user, array $data): SparePart
    {
        $payload = $this->normalizer->handle($data);
        $payload['company_id'] = $user->company_id;

        $part = $user->spareParts()->create($payload);

        $this->auditLogger->record(
            $user,
            'spare_part.created',
            $part,
            [],
            $this->auditLogger->snapshot($part)
        );

        return $part;
    }
}
