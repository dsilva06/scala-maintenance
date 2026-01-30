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

        if (array_key_exists('items', $attributes) && is_array($attributes['items'])) {
            $attributes['items'] = array_map(function ($item) {
                if (!is_array($item)) {
                    return $item;
                }

                if (array_key_exists('product_name', $item) && is_string($item['product_name'])) {
                    $value = trim($item['product_name']);
                    $item['product_name'] = $value === '' ? null : $value;
                }

                return $item;
            }, $attributes['items']);
        }

        return $attributes;
    }
}
