<?php

namespace App\Queries\TireAssignments;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Models\TireAssignment;
use App\Models\User;
use App\Support\CompanyScope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class TireAssignmentIndexQuery
{
    use HandlesQueryOptions;

    public function handle(Request $request, User $user): Builder
    {
        $query = CompanyScope::apply(TireAssignment::query(), $user)
            ->with(['tire.type', 'position', 'vehicle']);

        if ($vehicleId = $request->query('vehicle_id')) {
            $query->where('vehicle_id', $vehicleId);
        }

        if ($tireId = $request->query('tire_id')) {
            $query->where('tire_id', $tireId);
        }

        if ($request->boolean('active')) {
            $query->whereNull('dismounted_at');
        }

        $this->applyQueryOptions($request, $query, [
            'created_at',
            'updated_at',
            'mounted_at',
        ], [
            'reason',
        ]);

        return $query;
    }
}
