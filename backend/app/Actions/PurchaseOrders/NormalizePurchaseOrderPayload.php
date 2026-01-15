<?php

namespace App\Actions\PurchaseOrders;

use Illuminate\Support\Str;

class NormalizePurchaseOrderPayload
{
    public function handle(array $attributes): array
    {
        foreach (['order_number', 'supplier', 'product_name', 'status', 'priority', 'notes'] as $key) {
            if (array_key_exists($key, $attributes) && is_string($attributes[$key])) {
                $value = trim($attributes[$key]);
                $attributes[$key] = $value === '' ? null : $value;
                if (in_array($key, ['status', 'priority'], true) && $attributes[$key] !== null) {
                    $attributes[$key] = Str::lower($attributes[$key]);
                }
            }
        }

        return $attributes;
    }
}
