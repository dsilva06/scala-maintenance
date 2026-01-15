<?php

namespace App\Actions\Vehicles;

use Illuminate\Support\Str;

class NormalizeVehiclePayload
{
    public function handle(array $attributes): array
    {
        if (array_key_exists('plate', $attributes)) {
            $attributes['plate'] = Str::upper(trim($attributes['plate']));
        }

        foreach (['brand', 'model', 'color', 'vin', 'vehicle_type', 'status', 'fuel_type', 'assigned_driver'] as $key) {
            if (array_key_exists($key, $attributes) && is_string($attributes[$key])) {
                $attributes[$key] = trim($attributes[$key]);
            }
        }

        return $attributes;
    }
}
