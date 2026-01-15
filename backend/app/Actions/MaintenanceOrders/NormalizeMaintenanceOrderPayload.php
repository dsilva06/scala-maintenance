<?php

namespace App\Actions\MaintenanceOrders;

use Illuminate\Support\Str;

class NormalizeMaintenanceOrderPayload
{
    public function handle(array $attributes): array
    {
        if (array_key_exists('order_number', $attributes)) {
            $attributes['order_number'] = Str::upper(trim($attributes['order_number']));
        }

        foreach (['type', 'status', 'priority', 'title', 'description', 'mechanic'] as $key) {
            if (array_key_exists($key, $attributes) && is_string($attributes[$key])) {
                $attributes[$key] = trim($attributes[$key]);
            }
        }

        return $attributes;
    }
}
