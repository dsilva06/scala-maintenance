<?php

namespace App\Queries\Trips;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Models\Trip;
use App\Models\User;
use App\Support\CompanyScope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class TripIndexQuery
{
    use HandlesQueryOptions;

    public function handle(Request $request, User $user): Builder
    {
        $query = CompanyScope::apply(
            Trip::query()->with(['vehicle', 'latestPosition']),
            $user
        );

        $this->applyQueryOptions($request, $query, [
            'start_date',
            'created_at',
            'status',
        ], [
            'origin',
            'destination',
            'driver_name',
        ]);

        return $query;
    }
}
