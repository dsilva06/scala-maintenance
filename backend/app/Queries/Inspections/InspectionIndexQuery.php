<?php

namespace App\Queries\Inspections;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Models\Inspection;
use App\Models\User;
use App\Support\CompanyScope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class InspectionIndexQuery
{
    use HandlesQueryOptions;

    public function handle(Request $request, User $user): Builder
    {
        $query = CompanyScope::apply(Inspection::query()->with('vehicle'), $user);

        if ($vehicleId = $request->query('vehicle_id')) {
            $query->where('vehicle_id', $vehicleId);
        }

        if ($month = $request->query('month')) {
            try {
                $start = Carbon::parse($month . '-01')->startOfMonth();
                $end = (clone $start)->endOfMonth();
                $query->whereBetween('inspection_date', [$start, $end]);
            } catch (\Exception $e) {
                // ignore invalid month format
            }
        }

        $this->applyQueryOptions($request, $query, [
            'inspection_date',
            'created_at',
            'overall_status',
        ], [
            'inspector',
            'overall_status',
        ]);

        return $query;
    }
}
