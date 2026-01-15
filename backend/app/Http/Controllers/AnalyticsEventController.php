<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\AuthorizesCompanyResource;
use App\Http\Requests\AnalyticsEventStoreRequest;
use App\Jobs\IngestAnalyticsEventsJob;
use App\Models\AnalyticsEvent;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsEventController extends Controller
{
    use AuthorizesCompanyResource;

    public function store(AnalyticsEventStoreRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->company_id) {
            abort(403, 'No autorizado.');
        }

        $validated = $request->validated();
        $events = $validated['events'];

        IngestAnalyticsEventsJob::dispatch(
            $user->company_id,
            $user->id,
            $events,
            $request->ip(),
            $request->userAgent()
        )->afterCommit();

        return response()->json([
            'data' => [
                'queued' => true,
                'events' => count($events),
            ],
        ], 202);
    }

    public function summary(Request $request): JsonResponse
    {
        $this->authorizeCompanyWrite($request);

        $user = $request->user();
        $rangeDays = (int) config('analytics.default_range_days', 30);
        $start = $request->query('start_date')
            ? Carbon::parse($request->query('start_date'))
            : now()->subDays($rangeDays);
        $end = $request->query('end_date')
            ? Carbon::parse($request->query('end_date'))
            : now();

        $query = AnalyticsEvent::query()
            ->where('company_id', $user->company_id)
            ->whereBetween('occurred_at', [$start, $end]);

        $totalEvents = (clone $query)->count();
        $uniqueUsers = (clone $query)->distinct('user_id')->count('user_id');

        $byEvent = $query
            ->selectRaw('event_name, COUNT(*) as total')
            ->groupBy('event_name')
            ->orderByDesc('total')
            ->limit(20)
            ->get()
            ->map(fn ($row) => [
                'name' => $row->event_name,
                'total' => (int) $row->total,
            ]);

        return response()->json([
            'data' => [
                'range' => [
                    'start_date' => $start->toDateTimeString(),
                    'end_date' => $end->toDateTimeString(),
                ],
                'total_events' => $totalEvents,
                'unique_users' => $uniqueUsers,
                'events' => $byEvent,
            ],
        ]);
    }
}
