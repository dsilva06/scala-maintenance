<?php

namespace App\Actions\TireAssignments;

use App\Models\Tire;
use App\Models\TireAssignment;
use App\Models\TirePosition;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AssignTire
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function handle(User $user, array $data): TireAssignment
    {
        $tire = Tire::query()
            ->where('id', $data['tire_id'])
            ->where('company_id', $user->company_id)
            ->firstOrFail();

        $position = TirePosition::query()
            ->where('id', $data['tire_position_id'])
            ->where('company_id', $user->company_id)
            ->firstOrFail();

        if ((int) $position->vehicle_id !== (int) $data['vehicle_id']) {
            throw ValidationException::withMessages([
                'tire_position_id' => ['La posicion no pertenece al vehiculo seleccionado.'],
            ]);
        }

        $tire->loadMissing('type');
        $positionRole = $position->position_role;
        $typeUsage = $tire->type?->usage ?? 'traction';
        if ($positionRole === 'directional' && $typeUsage !== 'directional') {
            throw ValidationException::withMessages([
                'tire_id' => ['Este caucho es de tracción y no puede usarse en una posición direccional.'],
            ]);
        }

        $mountedAt = isset($data['mounted_at']) ? Carbon::parse($data['mounted_at']) : now();
        $mountedMileage = isset($data['mounted_mileage']) ? (int) $data['mounted_mileage'] : null;
        $reason = $data['reason'] ?? null;

        return DB::transaction(function () use ($user, $tire, $position, $mountedAt, $mountedMileage, $reason) {
            $activeForPosition = TireAssignment::query()
                ->where('company_id', $user->company_id)
                ->where('tire_position_id', $position->id)
                ->whereNull('dismounted_at')
                ->first();

            if ($activeForPosition && (int) $activeForPosition->tire_id === (int) $tire->id) {
                return $activeForPosition;
            }

            $activeForTire = TireAssignment::query()
                ->where('company_id', $user->company_id)
                ->where('tire_id', $tire->id)
                ->whereNull('dismounted_at')
                ->first();

            if ($activeForTire) {
                $activeForTire->forceFill([
                    'dismounted_at' => $mountedAt,
                    'dismounted_mileage' => $mountedMileage,
                    'reason' => $activeForTire->reason ?? 'reubicado',
                ])->save();
            }

            if ($activeForPosition) {
                $activeForPosition->forceFill([
                    'dismounted_at' => $mountedAt,
                    'dismounted_mileage' => $mountedMileage,
                    'reason' => $activeForPosition->reason ?? 'reubicado',
                ])->save();
            }

            $assignment = TireAssignment::create([
                'company_id' => $user->company_id,
                'tire_id' => $tire->id,
                'vehicle_id' => $position->vehicle_id,
                'tire_position_id' => $position->id,
                'mounted_at' => $mountedAt,
                'mounted_mileage' => $mountedMileage,
                'reason' => $reason,
            ]);

            $this->auditLogger->record(
                $user,
                'tire_assignment.created',
                $assignment,
                [],
                $this->auditLogger->snapshot($assignment)
            );

            return $assignment;
        });
    }
}
