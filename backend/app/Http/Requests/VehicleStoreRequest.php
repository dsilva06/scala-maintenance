<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VehicleStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()?->id;

        return [
            'plate' => [
                'required',
                'string',
                'max:50',
                Rule::unique('vehicles', 'plate')->where('user_id', $userId),
            ],
            'brand' => ['required', 'string', 'max:100'],
            'model' => ['required', 'string', 'max:100'],
            'year' => ['nullable', 'integer', 'between:1900,' . ((int) date('Y') + 1)],
            'color' => ['nullable', 'string', 'max:50'],
            'vin' => ['nullable', 'string', 'max:120'],
            'current_mileage' => ['nullable', 'integer', 'min:0'],
            'vehicle_type' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'string', 'max:50'],
            'fuel_type' => ['nullable', 'string', 'max:50'],
            'last_service_date' => ['nullable', 'date'],
            'next_service_date' => ['nullable', 'date'],
            'assigned_driver' => ['nullable', 'string', 'max:120'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
