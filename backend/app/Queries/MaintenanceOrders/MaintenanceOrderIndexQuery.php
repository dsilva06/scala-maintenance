<?php

namespace App\Queries\MaintenanceOrders;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Models\MaintenanceOrder;
use App\Models\User;
use App\Support\CompanyScope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class MaintenanceOrderIndexQuery
{
    use HandlesQueryOptions;

    public function handle(Request $request, User $user): Builder
    {
        $query = CompanyScope::apply(MaintenanceOrder::query()->with('vehicle'), $user);

        if ($vehicleId = $request->query('vehicle_id')) {
            $query->where('vehicle_id', $vehicleId);
        }

        if ($month = $request->query('month')) {
            try {
                $start = Carbon::parse($month . '-01')->startOfMonth();
                $end = (clone $start)->endOfMonth();
                $query->whereBetween('created_at', [$start, $end]);
            } catch (\Exception $e) {
                // ignore invalid month format
            }
        }

        $this->applyQueryOptions($request, $query, [
            'created_at',
            'updated_at',
            'scheduled_date',
            'priority',
            'status',
        ], [
            'order_number',
            'title',
            'description',
            'mechanic',
        ]);

        return $query;
    }
}
