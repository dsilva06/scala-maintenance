<?php

namespace App\Actions\Inspections;

use App\Actions\TireAssignments\AssignTire;
use App\Models\Inspection;
use App\Models\Tire;
use App\Models\TireInspection;
use App\Models\TirePosition;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TireInspectionHandler
{
    private const RAPID_WEAR_MM_PER_1000_KM = 1.0;

    public function __construct(private AssignTire $assignTire)
    {
    }

    public function sync(User $user, Inspection $inspection, ?array $checks): void
    {
        if ($checks === null) {
            return;
        }

        $normalized = $this->normalizeChecks($checks);

        DB::transaction(function () use ($user, $inspection, $normalized) {
            $inspection->tireInspections()->delete();

            if ($normalized === []) {
                $this->storeAlerts($inspection, []);
                return;
            }

            $alerts = [];

            foreach ($normalized as $check) {
                $position = TirePosition::query()
                    ->where('id', $check['tire_position_id'])
                    ->where('company_id', $inspection->company_id)
                    ->first();

                if (!$position) {
                    continue;
                }

                if ((int) $position->vehicle_id !== (int) $inspection->vehicle_id) {
                    continue;
                }

                $tire = $this->resolveTire($user, $check);

                $assignment = null;
                if ($tire) {
                    $assignment = $this->ensureAssignment($user, $inspection, $tire, $position);
                }

                $statusData = $this->evaluateStatus($inspection, $tire, $check);
                $alerts = array_merge($alerts, $statusData['alerts']);

                TireInspection::create([
                    'company_id' => $inspection->company_id,
                    'inspection_id' => $inspection->id,
                    'tire_assignment_id' => $assignment?->id,
                    'tire_id' => $tire?->id,
                    'vehicle_id' => $inspection->vehicle_id,
                    'tire_position_id' => $position->id,
                    'inspection_date' => $inspection->inspection_date,
                    'mileage' => $inspection->mileage,
                    'pressure_psi' => $check['pressure_psi'],
                    'depth_mm' => $check['depth_mm'],
                    'status' => $statusData['status'],
                    'notes' => $check['notes'] ?? null,
                ]);
            }

            $this->storeAlerts($inspection, $alerts);
        });
    }

    private function normalizeChecks(array $checks): array
    {
        $normalized = [];

        foreach ($checks as $check) {
            if (!is_array($check)) {
                continue;
            }

            $positionId = $check['tire_position_id'] ?? null;
            $positionId = is_numeric($positionId) ? (int) $positionId : null;
            if (!$positionId) {
                continue;
            }

            $normalized[] = [
                'tire_position_id' => $positionId,
                'tire_id' => is_numeric($check['tire_id'] ?? null) ? (int) $check['tire_id'] : null,
                'tire_serial' => isset($check['tire_serial']) && is_string($check['tire_serial'])
                    ? $this->normalizeSerial($check['tire_serial'])
                    : null,
                'tire_type_id' => is_numeric($check['tire_type_id'] ?? null) ? (int) $check['tire_type_id'] : null,
                'pressure_psi' => is_numeric($check['pressure_psi'] ?? null) ? (float) $check['pressure_psi'] : null,
                'depth_mm' => is_numeric($check['depth_mm'] ?? null) ? (float) $check['depth_mm'] : null,
                'min_depth_mm' => is_numeric($check['min_depth_mm'] ?? null) ? (float) $check['min_depth_mm'] : null,
                'depth_new_mm' => is_numeric($check['depth_new_mm'] ?? null) ? (float) $check['depth_new_mm'] : null,
                'notes' => $check['notes'] ?? null,
            ];
        }

        return $normalized;
    }

    private function normalizeSerial(string $serial): ?string
    {
        $trimmed = trim($serial);
        return $trimmed === '' ? null : $trimmed;
    }

    private function resolveTire(User $user, array $check): ?Tire
    {
        if ($check['tire_id']) {
            return Tire::query()
                ->where('id', $check['tire_id'])
                ->where('company_id', $user->company_id)
                ->first();
        }

        $serial = $check['tire_serial'] ?? null;
        if (!$serial) {
            return null;
        }

        $tire = Tire::query()
            ->where('serial', $serial)
            ->where('company_id', $user->company_id)
            ->first();

        if ($tire) {
            return $tire;
        }

        if (!$check['tire_type_id'] || $check['min_depth_mm'] === null) {
            throw ValidationException::withMessages([
                'tire_checks' => ['Debes seleccionar el tipo de caucho y profundidad mínima para registrar un serial nuevo.'],
            ]);
        }

        return Tire::create([
            'company_id' => $user->company_id,
            'user_id' => $user->id,
            'tire_type_id' => $check['tire_type_id'],
            'serial' => $serial,
            'depth_new_mm' => $check['depth_new_mm'],
            'min_depth_mm' => $check['min_depth_mm'],
            'status' => 'activo',
        ]);
    }

    private function ensureAssignment(User $user, Inspection $inspection, Tire $tire, TirePosition $position)
    {
        $active = $position->assignments()
            ->whereNull('dismounted_at')
            ->first();

        if ($active && (int) $active->tire_id === (int) $tire->id) {
            return $active;
        }

        return $this->assignTire->handle($user, [
            'tire_id' => $tire->id,
            'vehicle_id' => $inspection->vehicle_id,
            'tire_position_id' => $position->id,
            'mounted_at' => $inspection->inspection_date ?? now(),
            'mounted_mileage' => $inspection->mileage,
            'reason' => 'inspeccion',
        ]);
    }

    private function evaluateStatus(Inspection $inspection, ?Tire $tire, array $check): array
    {
        $alerts = [];
        $status = 'ok';

        if (!$tire) {
            return ['status' => $status, 'alerts' => $alerts];
        }

        $pressureTarget = $tire->type?->pressure_target_psi;
        $tolerance = (float) ($tire->type?->pressure_tolerance_pct ?? 10);
        $pressure = $check['pressure_psi'];

        if ($pressureTarget !== null && $pressure !== null) {
            $minPressure = $pressureTarget * (1 - ($tolerance / 100));
            if ($pressure < $minPressure) {
                $status = 'alerta';
                $alerts[] = $this->buildAlert($inspection, $tire, $check, 'baja_presion', 'Presión baja');
            }
        }

        $minDepth = $tire->min_depth_mm;
        $depth = $check['depth_mm'];
        if ($minDepth !== null && $depth !== null && $depth <= $minDepth) {
            $status = 'alerta';
            $alerts[] = $this->buildAlert($inspection, $tire, $check, 'baja_profundidad', 'Profundidad bajo el mínimo');
        }

        $wearAlert = $this->checkRapidWear($inspection, $tire, $depth);
        if ($wearAlert) {
            $status = 'alerta';
            $alerts[] = $wearAlert;
        }

        return ['status' => $status, 'alerts' => $alerts];
    }

    private function checkRapidWear(Inspection $inspection, Tire $tire, ?float $currentDepth): ?array
    {
        if ($currentDepth === null || $inspection->mileage === null) {
            return null;
        }

        $previous = TireInspection::query()
            ->where('company_id', $inspection->company_id)
            ->where('tire_id', $tire->id)
            ->whereNotNull('depth_mm')
            ->whereNotNull('mileage')
            ->where('inspection_id', '!=', $inspection->id)
            ->orderByDesc('inspection_date')
            ->first();

        if (!$previous) {
            return null;
        }

        $deltaDepth = $previous->depth_mm - $currentDepth;
        $deltaMileage = $inspection->mileage - $previous->mileage;

        if ($deltaDepth <= 0 || $deltaMileage <= 0) {
            return null;
        }

        $wearPer1000 = ($deltaDepth / $deltaMileage) * 1000;

        if ($wearPer1000 >= self::RAPID_WEAR_MM_PER_1000_KM) {
            return $this->buildAlert($inspection, $tire, [
                'tire_position_id' => $previous->tire_position_id,
            ], 'desgaste_acelerado', 'Desgaste acelerado');
        }

        return null;
    }

    private function buildAlert(Inspection $inspection, Tire $tire, array $check, string $type, string $title): array
    {
        return [
            'type' => $type,
            'title' => $title,
            'inspection_id' => $inspection->id,
            'vehicle_id' => $inspection->vehicle_id,
            'tire_id' => $tire->id,
            'tire_serial' => $tire->serial,
            'tire_position_id' => $check['tire_position_id'] ?? null,
        ];
    }

    private function storeAlerts(Inspection $inspection, array $alerts): void
    {
        $metadata = $inspection->metadata ?? [];
        $metadata['tire_alerts'] = $alerts;
        $metadata['tire_alerts_count'] = count($alerts);

        $inspection->forceFill(['metadata' => $metadata])->save();
    }
}
