<?php

namespace App\Queries\RepairGuides;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Models\RepairGuide;
use App\Models\User;
use App\Support\CompanyScope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class RepairGuideIndexQuery
{
    use HandlesQueryOptions;

    public function handle(Request $request, User $user): Builder
    {
        $query = CompanyScope::apply(RepairGuide::query(), $user);

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        $this->applyQueryOptions($request, $query, [
            'created_at',
            'updated_at',
            'name',
            'priority',
        ], [
            'name',
            'description',
            'category',
            'type',
        ]);

        return $query;
    }
}
