<?php

namespace App\Actions\Documents;

use App\Models\Document;
use App\Models\User;
use App\Services\AuditLogger;

class CreateDocument
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function handle(User $user, array $data): Document
    {
        $payload = $data;
        $payload['company_id'] = $user->company_id;

        $document = $user->documents()->create($payload);

        $this->auditLogger->record(
            $user,
            'document.created',
            $document,
            [],
            $this->auditLogger->snapshot($document)
        );

        return $document;
    }
}
