<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\AppliesUserCompanyRules;
use Illuminate\Foundation\Http\FormRequest;

class VehicleStoreRequest extends FormRequest
{
    use AppliesUserCompanyRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plate' => [
                'required',
                'string',
                'max:50',
                $this->uniqueForUserCompany('vehicles', 'plate'),
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
