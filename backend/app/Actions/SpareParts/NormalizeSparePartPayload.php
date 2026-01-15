<?php

namespace App\Actions\SpareParts;

use Illuminate\Support\Str;

class NormalizeSparePartPayload
{
    public function handle(array $attributes): array
    {
        if (array_key_exists('sku', $attributes)) {
            $attributes['sku'] = Str::upper(trim($attributes['sku']));
        }

        if (array_key_exists('part_number', $attributes)) {
            $attributes['part_number'] = $attributes['part_number'] === null || $attributes['part_number'] === ''
                ? null
                : Str::upper(trim($attributes['part_number']));
        }

        foreach (['name', 'brand', 'category', 'supplier', 'storage_location', 'status'] as $key) {
            if (array_key_exists($key, $attributes) && is_string($attributes[$key])) {
                $value = trim($attributes[$key]);
                $attributes[$key] = $value === '' ? null : $value;
            }
        }

        if (array_key_exists('photo_url', $attributes) && is_string($attributes['photo_url'])) {
            $attributes['photo_url'] = trim($attributes['photo_url']);
        }

        foreach (['unit_cost'] as $numeric) {
            if (array_key_exists($numeric, $attributes) && $attributes[$numeric] === '') {
                $attributes[$numeric] = null;
            }
        }

        return $attributes;
    }
}
