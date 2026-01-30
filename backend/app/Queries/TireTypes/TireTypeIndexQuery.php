<?php

namespace App\Queries\TireTypes;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Models\TireType;
use App\Models\User;
use App\Support\CompanyScope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class TireTypeIndexQuery
{
    use HandlesQueryOptions;

    public function handle(Request $request, User $user): Builder
    {
        $query = CompanyScope::apply(TireType::query(), $user);

        $this->applyQueryOptions($request, $query, [
            'created_at',
            'updated_at',
            'name',
        ], [
            'name',
            'brand',
            'model',
            'size',
        ]);

        return $query;
    }
}
