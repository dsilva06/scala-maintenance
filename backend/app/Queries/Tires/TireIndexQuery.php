<?php

namespace App\Queries\Tires;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Models\Tire;
use App\Models\User;
use App\Support\CompanyScope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class TireIndexQuery
{
    use HandlesQueryOptions;

    public function handle(Request $request, User $user): Builder
    {
        $query = CompanyScope::apply(Tire::query(), $user)->with('type');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($typeId = $request->query('tire_type_id')) {
            $query->where('tire_type_id', $typeId);
        }

        $this->applyQueryOptions($request, $query, [
            'created_at',
            'updated_at',
            'serial',
        ], [
            'serial',
            'status',
        ]);

        return $query;
    }
}
