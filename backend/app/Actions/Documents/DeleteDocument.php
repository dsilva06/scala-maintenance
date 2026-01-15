<?php

namespace App\Actions\Documents;

use App\Models\User;
use App\Models\Document;
use App\Services\AuditLogger;

class DeleteDocument
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function handle(User $user, Document $document): void
    {
        $before = $this->auditLogger->snapshot($document);
        $document->delete();

        $this->auditLogger->record($user, 'document.deleted', $document, $before, []);
    }
}
