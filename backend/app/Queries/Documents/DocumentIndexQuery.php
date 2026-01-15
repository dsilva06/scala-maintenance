<?php

namespace App\Queries\Documents;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Models\Document;
use App\Models\User;
use App\Support\CompanyScope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class DocumentIndexQuery
{
    use HandlesQueryOptions;

    public function handle(Request $request, User $user): Builder
    {
        $query = CompanyScope::apply(Document::query()->with('vehicle'), $user);

        if ($vehicleId = $request->query('vehicle_id')) {
            $query->where('vehicle_id', $vehicleId);
        }

        if ($type = $request->query('document_type')) {
            $query->where('document_type', $type);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $this->applyQueryOptions($request, $query, [
            'expiration_date',
            'created_at',
            'document_type',
        ], [
            'document_number',
            'issuing_entity',
            'document_type',
        ]);

        return $query;
    }
}
