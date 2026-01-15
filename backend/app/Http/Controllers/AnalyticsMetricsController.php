<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\AuthorizesCompanyResource;
use App\Services\Analytics\AnalyticsMetricsService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsMetricsController extends Controller
{
    use AuthorizesCompanyResource;

    public function index(Request $request, AnalyticsMetricsService $metricsService): JsonResponse
    {
        $user = $request->user();
        if (!$user || !$user->company_id) {
            abort(403, 'No autorizado.');
        }
        $rangeDays = (int) config('analytics.default_range_days', 30);
        $start = $request->query('start_date')
            ? Carbon::parse($request->query('start_date'))
            : now()->subDays($rangeDays);
        $end = $request->query('end_date')
            ? Carbon::parse($request->query('end_date'))
            : now();

        $metrics = $metricsService->summarize($user->company_id, $start, $end);

        return response()->json([
            'data' => [
                'range' => [
                    'start_date' => $start->toDateTimeString(),
                    'end_date' => $end->toDateTimeString(),
                ],
                'metrics' => $metrics,
            ],
        ]);
    }
}
