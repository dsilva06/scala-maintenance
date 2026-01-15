<?php

namespace App\Queries\Alerts;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Models\Alert;
use App\Models\User;
use App\Support\CompanyScope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class AlertIndexQuery
{
    use HandlesQueryOptions;

    public function handle(Request $request, User $user): Builder
    {
        $query = CompanyScope::apply(Alert::query(), $user);

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $this->applyQueryOptions($request, $query, [
            'created_at',
            'severity',
            'status',
        ], [
            'title',
            'description',
            'type',
            'severity',
        ]);

        return $query;
    }
}
