<?php

namespace App\Actions\Suppliers;

class NormalizeSupplierPayload
{
    public function handle(array $attributes): array
    {
        foreach (['name', 'contact_name', 'phone', 'email', 'notes'] as $key) {
            if (array_key_exists($key, $attributes) && is_string($attributes[$key])) {
                $value = trim($attributes[$key]);
                $attributes[$key] = $value === '' ? null : $value;
            }
        }

        return $attributes;
    }
}
