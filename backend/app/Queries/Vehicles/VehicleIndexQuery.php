<?php

namespace App\Queries\Vehicles;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Models\Vehicle;
use App\Models\User;
use App\Support\CompanyScope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class VehicleIndexQuery
{
    use HandlesQueryOptions;

    public function handle(Request $request, User $user): Builder
    {
        $query = CompanyScope::apply(Vehicle::query(), $user)
            ->with('tirePositions');

        $this->applyQueryOptions($request, $query, [
            'created_at',
            'updated_at',
            'plate',
            'brand',
        ], [
            'plate',
            'brand',
            'model',
            'vin',
        ]);

        return $query;
    }
}
