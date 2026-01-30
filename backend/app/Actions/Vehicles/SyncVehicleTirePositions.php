<?php

namespace App\Actions\Vehicles;

use App\Models\TirePosition;
use App\Models\Vehicle;

class SyncVehicleTirePositions
{
    public function handle(Vehicle $vehicle, ?array $positions, bool $reset = false): void
    {
        if ($positions === null) {
            return;
        }

        $normalized = $this->normalize($positions);
        $incomingCodes = collect($normalized)->pluck('position_code')->unique()->all();

        $existing = $vehicle->tirePositions()->get()->keyBy('position_code');

        foreach ($normalized as $payload) {
            $code = $payload['position_code'];
            if ($existing->has($code)) {
                $existing->get($code)->update($payload);
            } else {
                $vehicle->tirePositions()->create(array_merge($payload, [
                    'company_id' => $vehicle->company_id,
                ]));
            }
        }

        if (!$reset) {
            return;
        }

        $existing->each(function (TirePosition $position) use ($incomingCodes) {
            if (in_array($position->position_code, $incomingCodes, true)) {
                return;
            }

            if ($position->assignments()->whereNull('dismounted_at')->exists()) {
                return;
            }

            $position->delete();
        });
    }

    private function normalize(array $positions): array
    {
        $normalized = [];

        foreach ($positions as $position) {
            if (!is_array($position)) {
                continue;
            }

            $code = $position['position_code'] ?? null;
            if (!is_string($code) || trim($code) === '') {
                continue;
            }

            $label = $position['label'] ?? null;
            if (is_string($label)) {
                $label = trim($label);
                $label = $label === '' ? null : $label;
            }

            $normalized[] = [
                'axle_index' => (int) ($position['axle_index'] ?? 1),
                'position_code' => trim($code),
                'label' => $label,
                'position_role' => isset($position['position_role']) && is_string($position['position_role'])
                    ? trim($position['position_role'])
                    : null,
                'is_spare' => (bool) ($position['is_spare'] ?? false),
            ];
        }

        return $normalized;
    }
}
