<?php

namespace App\Queries\PurchaseOrders;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Models\PurchaseOrder;
use App\Models\User;
use App\Support\CompanyScope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class PurchaseOrderIndexQuery
{
    use HandlesQueryOptions;

    public function handle(Request $request, User $user): Builder
    {
        $query = CompanyScope::apply(PurchaseOrder::query(), $user)
            ->with('items');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
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
            'expected_date',
            'priority',
            'status',
            'total_cost',
        ], [
            'order_number',
            'supplier',
            'product_name',
            'status',
            'priority',
        ]);

        return $query;
    }
}
