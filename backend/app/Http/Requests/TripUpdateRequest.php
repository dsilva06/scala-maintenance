<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\AppliesUserCompanyRules;
use Illuminate\Foundation\Http\FormRequest;

class TripUpdateRequest extends FormRequest
{
    use AppliesUserCompanyRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => [
                'sometimes',
                'nullable',
                $this->existsForUserCompany('vehicles', 'id'),
            ],
            'driver_id' => ['sometimes', 'nullable', 'string', 'max:120'],
            'driver_name' => ['sometimes', 'nullable', 'string', 'max:150'],
            'origin' => ['sometimes', 'nullable', 'string', 'max:150'],
            'destination' => ['sometimes', 'nullable', 'string', 'max:150'],
            'origin_coords' => ['sometimes', 'nullable', 'array'],
            'destination_coords' => ['sometimes', 'nullable', 'array'],
            'start_date' => ['sometimes', 'nullable', 'date'],
            'estimated_arrival' => ['sometimes', 'nullable', 'date'],
            'distance_planned' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'status' => ['sometimes', 'nullable', 'string', 'max:50'],
            'cargo_description' => ['sometimes', 'nullable', 'string'],
            'cargo_weight' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'planned_route' => ['sometimes', 'nullable', 'array'],
            'metadata' => ['sometimes', 'nullable', 'array'],
        ];
    }
}
