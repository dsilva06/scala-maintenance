<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TripStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => ['nullable', 'exists:vehicles,id'],
            'driver_id' => ['nullable', 'string', 'max:120'],
            'driver_name' => ['nullable', 'string', 'max:150'],
            'origin' => ['nullable', 'string', 'max:150'],
            'destination' => ['nullable', 'string', 'max:150'],
            'origin_coords' => ['nullable', 'array'],
            'destination_coords' => ['nullable', 'array'],
            'start_date' => ['nullable', 'date'],
            'estimated_arrival' => ['nullable', 'date'],
            'distance_planned' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', 'string', 'max:50'],
            'cargo_description' => ['nullable', 'string'],
            'cargo_weight' => ['nullable', 'numeric', 'min:0'],
            'planned_route' => ['nullable', 'array'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
