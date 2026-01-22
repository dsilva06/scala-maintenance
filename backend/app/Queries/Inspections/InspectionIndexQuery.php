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
        $summary = $request->boolean('summary');
        $baseQuery = Inspection::query();
        if (!$summary) {
            $baseQuery->with('vehicle');
        }

        $query = CompanyScope::apply($baseQuery, $user);

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

        if ($summary) {
            $query->select([
                'id',
                'user_id',
                'company_id',
                'vehicle_id',
                'inspection_date',
                'overall_status',
                'inspector',
                'mileage',
                'created_at',
            ]);
        }

        return $query;
    }
}
