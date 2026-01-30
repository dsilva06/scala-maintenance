<?php

namespace App\Services\Analytics;

use App\Models\MaintenanceOrder;
// use App\Models\Trip;
use Carbon\Carbon;

class AnalyticsMetricsService
{
    /**
     * @return array<string, mixed>
     */
    public function summarize(int $companyId, Carbon $start, Carbon $end): array
    {
        return [
            // 'cost_per_mile' => $this->costPerMile($companyId, $start, $end),
            'downtime_hours' => $this->downtimeHours($companyId, $start, $end),
            // 'eta_accuracy' => $this->etaAccuracy($companyId, $start, $end),
        ];
    }

    // Trip metrics disabled for this release.
    // /**
    //  * @return array<string, mixed>
    //  */
    // private function costPerMile(int $companyId, Carbon $start, Carbon $end): array
    // {
    //     $maintenanceCost = MaintenanceOrder::query()
    //         ->where('company_id', $companyId)
    //         ->whereNotNull('actual_cost')
    //         ->whereBetween('completion_date', [$start, $end])
    //         ->sum('actual_cost');
    //
    //     $distance = Trip::query()
    //         ->where('company_id', $companyId)
    //         ->whereNotNull('distance_planned')
    //         ->whereBetween('start_date', [$start, $end])
    //         ->sum('distance_planned');
    //
    //     return [
    //         'value' => $distance > 0 ? round($maintenanceCost / $distance, 4) : null,
    //         'total_cost' => (float) $maintenanceCost,
    //         'total_distance' => (float) $distance,
    //     ];
    // }

    /**
     * @return array<string, mixed>
     */
    private function downtimeHours(int $companyId, Carbon $start, Carbon $end): array
    {
        $orders = MaintenanceOrder::query()
            ->where('company_id', $companyId)
            ->whereNotNull('completion_date')
            ->whereBetween('completion_date', [$start, $end])
            ->get(['scheduled_date', 'completion_date', 'created_at']);

        $totalHours = 0.0;
        $count = 0;

        foreach ($orders as $order) {
            $startAt = $order->scheduled_date ?? $order->created_at;
            $endAt = $order->completion_date;

            if (!$startAt || !$endAt) {
                continue;
            }

            $minutes = $startAt->diffInMinutes($endAt);
            $totalHours += $minutes / 60;
            $count++;
        }

        return [
            'average' => $count > 0 ? round($totalHours / $count, 2) : null,
            'total' => round($totalHours, 2),
            'orders' => $count,
        ];
    }

    // /**
    //  * @return array<string, mixed>
    //  */
    // private function etaAccuracy(int $companyId, Carbon $start, Carbon $end): array
    // {
    //     $trips = Trip::query()
    //         ->where('company_id', $companyId)
    //         ->whereNotNull('estimated_arrival')
    //         ->whereBetween('start_date', [$start, $end])
    //         ->get(['estimated_arrival', 'metadata']);
    //
    //     $totalError = 0.0;
    //     $count = 0;
    //     $within15 = 0;
    //
    //     foreach ($trips as $trip) {
    //         $metadata = is_array($trip->metadata) ? $trip->metadata : [];
    //         $actual = $metadata['actual_arrival'] ?? $metadata['actual_arrival_at'] ?? null;
    //
    //         if (!$actual) {
    //             continue;
    //         }
    //
    //         try {
    //             $actualAt = Carbon::parse($actual);
    //         } catch (\Throwable $e) {
    //             continue;
    //         }
    //
    //         $estimatedAt = $trip->estimated_arrival;
    //         if (!$estimatedAt) {
    //             continue;
    //         }
    //
    //         $errorMinutes = abs($estimatedAt->diffInMinutes($actualAt, false));
    //         $totalError += $errorMinutes;
    //         $count++;
    //
    //         if ($errorMinutes <= 15) {
    //             $within15++;
    //         }
    //     }
    //
    //     return [
    //         'average_error_minutes' => $count > 0 ? round($totalError / $count, 2) : null,
    //         'trips' => $count,
    //         'within_15_min_rate' => $count > 0 ? round(($within15 / $count) * 100, 2) : null,
    //     ];
    // }
}
