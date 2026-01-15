<?php

namespace App\Actions\SpareParts;

use App\Models\User;
use App\Models\SparePart;
use App\Services\AuditLogger;

class UpdateSparePart
{
    public function __construct(
        private NormalizeSparePartPayload $normalizer,
        private AuditLogger $auditLogger
    )
    {
    }

    public function handle(User $user, SparePart $sparePart, array $data): SparePart
    {
        $before = $this->auditLogger->snapshot($sparePart);
        $payload = $this->normalizer->handle($data);
        unset($payload['company_id'], $payload['user_id']);
        $sparePart->update($payload);

        $this->auditLogger->record(
            $user,
            'spare_part.updated',
            $sparePart,
            $before,
            $this->auditLogger->snapshot($sparePart->refresh())
        );

        return $sparePart;
    }
}
