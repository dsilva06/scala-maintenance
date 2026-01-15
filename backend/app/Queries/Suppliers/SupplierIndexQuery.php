<?php

namespace App\Queries\Suppliers;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Models\Supplier;
use App\Models\User;
use App\Support\CompanyScope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class SupplierIndexQuery
{
    use HandlesQueryOptions;

    public function handle(Request $request, User $user): Builder
    {
        $query = CompanyScope::apply(Supplier::query(), $user);

        $this->applyQueryOptions($request, $query, [
            'created_at',
            'updated_at',
            'name',
        ], [
            'name',
            'contact_name',
            'email',
            'phone',
        ]);

        return $query;
    }
}
