<?php

namespace App\Services;

use App\Models\MaintenanceOrder;
use App\Models\SparePart;
use App\Models\SparePartLifeEvent;
use App\Models\SparePartLifeStat;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SparePartLifeService
{
    public function resolveExpectedLifeKm(SparePart $part): ?int
    {
        if ($part->expected_life_km !== null) {
            return (int) $part->expected_life_km;
        }

        return $this->resolveExpectedLifeKmForCategory($part->category);
    }

    public function resolveExpectedLifeKmForCategory(?string $category): ?int
    {
        if (!$category) {
            return null;
        }

        $defaults = (array) config('spare_parts.expected_life_km_by_category', []);
        $value = $defaults[$category] ?? null;

        return $value !== null ? (int) $value : null;
    }

    /**
     * @return array<string, mixed>
     */
    public function buildSnapshot(SparePart $part): array
    {
        $stat = $part->relationLoaded('lifeStat') ? $part->lifeStat : $part->lifeStat()->first();
        $expected = $this->resolveExpectedLifeKm($part);
        $expectedSource = $expected !== null ? ($part->expected_life_km !== null ? 'part' : 'category') : null;
        $baseline = $stat?->median_delta_km !== null ? (int) $stat->median_delta_km : null;

        if ($expected === null && $baseline !== null) {
            $expected = $baseline;
            $expectedSource = 'median';
        }

        $lastDelta = $stat?->last_delta_km !== null ? (int) $stat->last_delta_km : null;
        $ratio = null;
        $status = 'unknown';
        $warningThreshold = (float) config('spare_parts.life_ratio_warning', 0.8);

        if ($expected !== null && $expected > 0 && $lastDelta !== null) {
            $ratio = round($lastDelta / $expected, 3);
            $status = $ratio < $warningThreshold ? 'low' : 'ok';
        }

        $multiplier = null;
        $effectiveCost = null;

        if ($expected !== null && $lastDelta !== null && $lastDelta > 0) {
            $multiplier = round($expected / $lastDelta, 2);
            $unitCost = $part->unit_cost !== null ? (float) $part->unit_cost : null;
            if ($unitCost !== null) {
                $effectiveCost = round($unitCost * $multiplier, 2);
            }
        }

        return [
            'expected_km' => $expected,
            'expected_source' => $expectedSource ?? 'unknown',
            'baseline_km' => $baseline,
            'last_replacement_km' => $lastDelta,
            'last_completion_mileage' => $stat?->last_completion_mileage,
            'last_ratio' => $ratio,
            'status' => $status,
            'cost_multiplier' => $multiplier,
            'effective_unit_cost' => $effectiveCost,
            'sample_count' => $stat?->sample_count ?? 0,
        ];
    }

    public function recordOrderEvents(MaintenanceOrder $order): void
    {
        if ($order->status !== 'completada') {
            return;
        }

        if (!$order->completion_mileage || !$order->vehicle_id) {
            return;
        }

        $partsUsed = $order->relationLoaded('partsUsed')
            ? $order->partsUsed
            : $order->partsUsed()->get();

        if ($partsUsed->isEmpty()) {
            return;
        }

        DB::transaction(function () use ($order, $partsUsed) {
            foreach ($partsUsed as $partUsage) {
                if (!$partUsage->spare_part_id) {
                    continue;
                }

                $part = SparePart::query()
                    ->where('id', $partUsage->spare_part_id)
                    ->where('company_id', $order->company_id)
                    ->first();

                if (!$part) {
                    continue;
                }

                $previousEvent = SparePartLifeEvent::query()
                    ->where('company_id', $order->company_id)
                    ->where('vehicle_id', $order->vehicle_id)
                    ->where('spare_part_id', $part->id)
                    ->where('maintenance_order_id', '!=', $order->id)
                    ->orderByDesc('completion_mileage')
                    ->first();

                $delta = null;
                if ($previousEvent && $previousEvent->completion_mileage !== null) {
                    $candidate = (int) $order->completion_mileage - (int) $previousEvent->completion_mileage;
                    $delta = $candidate > 0 ? $candidate : null;
                }

                $expectedLife = $this->resolveExpectedLifeKm($part);

                $event = SparePartLifeEvent::updateOrCreate(
                    [
                        'company_id' => $order->company_id,
                        'spare_part_id' => $part->id,
                        'vehicle_id' => $order->vehicle_id,
                        'maintenance_order_id' => $order->id,
                    ],
                    [
                        'completion_mileage' => (int) $order->completion_mileage,
                        'delta_km' => $delta,
                        'quantity' => (int) ($partUsage->quantity ?? 1),
                        'expected_life_km' => $expectedLife,
                    ]
                );

                $this->updateStats($order->company_id, $part->id, $event);
            }
        });
    }

    private function updateStats(int $companyId, int $sparePartId, ?SparePartLifeEvent $latestEvent = null): void
    {
        $latest = $latestEvent ?: SparePartLifeEvent::query()
            ->where('company_id', $companyId)
            ->where('spare_part_id', $sparePartId)
            ->orderByDesc('completion_mileage')
            ->first();

        if (!$latest) {
            return;
        }

        $deltas = SparePartLifeEvent::query()
            ->where('company_id', $companyId)
            ->where('spare_part_id', $sparePartId)
            ->whereNotNull('delta_km')
            ->pluck('delta_km');

        $sampleCount = $deltas->count();
        $median = $this->median($deltas);
        $average = $sampleCount > 0 ? (int) round($deltas->avg()) : null;

        $ratio = null;
        if ($latest->delta_km !== null && $latest->expected_life_km) {
            $ratio = round(((int) $latest->delta_km) / (int) $latest->expected_life_km, 4);
        }

        $stat = SparePartLifeStat::firstOrNew([
            'company_id' => $companyId,
            'spare_part_id' => $sparePartId,
        ]);

        $stat->fill([
            'last_event_at' => $latest->created_at,
            'last_completion_mileage' => $latest->completion_mileage,
            'last_delta_km' => $latest->delta_km,
            'last_expected_life_km' => $latest->expected_life_km,
            'last_ratio' => $ratio,
            'median_delta_km' => $median,
            'average_delta_km' => $average,
            'sample_count' => $sampleCount,
        ]);

        $stat->save();
    }

    private function median(Collection $values): ?int
    {
        $filtered = $values->filter(fn ($value) => $value !== null)->values();
        $count = $filtered->count();

        if ($count === 0) {
            return null;
        }

        $sorted = $filtered->sort()->values();
        $middle = intdiv($count, 2);

        if ($count % 2 === 1) {
            return (int) $sorted[$middle];
        }

        return (int) round(((int) $sorted[$middle - 1] + (int) $sorted[$middle]) / 2);
    }
}
