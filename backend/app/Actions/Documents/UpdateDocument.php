<?php

namespace App\Actions\Documents;

use App\Models\User;
use App\Models\Document;
use App\Services\AuditLogger;

class UpdateDocument
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function handle(User $user, Document $document, array $data): Document
    {
        $before = $this->auditLogger->snapshot($document);
        $payload = $data;
        unset($payload['company_id'], $payload['user_id']);
        $document->update($payload);

        $this->auditLogger->record(
            $user,
            'document.updated',
            $document,
            $before,
            $this->auditLogger->snapshot($document->refresh())
        );

        return $document;
    }
}
