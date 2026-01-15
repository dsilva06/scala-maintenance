<?php

namespace App\Queries\SpareParts;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Models\SparePart;
use App\Models\User;
use App\Support\CompanyScope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class SparePartIndexQuery
{
    use HandlesQueryOptions;

    public function handle(Request $request, User $user): Builder
    {
        $query = CompanyScope::apply(SparePart::query(), $user);

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        $this->applyQueryOptions($request, $query, [
            'created_at',
            'updated_at',
            'name',
            'sku',
            'current_stock',
        ], [
            'name',
            'sku',
            'part_number',
            'brand',
            'category',
        ]);

        return $query;
    }
}
