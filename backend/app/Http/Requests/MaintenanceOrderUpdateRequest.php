<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MaintenanceOrderUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $maintenanceOrder = $this->route('maintenanceOrder');
        $userId = $this->user()?->id;

        return [
            'vehicle_id' => ['sometimes', 'nullable', 'exists:vehicles,id'],
            'order_number' => [
                'sometimes',
                'string',
                'max:120',
                Rule::unique('maintenance_orders', 'order_number')
                    ->where('user_id', $userId)
                    ->ignore($maintenanceOrder?->id),
            ],
            'type' => ['sometimes', 'string', 'max:50'],
            'status' => ['sometimes', 'string', 'max:50'],
            'priority' => ['sometimes', 'string', 'max:50'],
            'title' => ['sometimes', 'nullable', 'string', 'max:150'],
            'description' => ['sometimes', 'nullable', 'string'],
            'mechanic' => ['sometimes', 'nullable', 'string', 'max:120'],
            'scheduled_date' => ['sometimes', 'nullable', 'date'],
            'completion_date' => ['sometimes', 'nullable', 'date'],
            'completion_mileage' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'estimated_cost' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'actual_cost' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'tasks' => ['sometimes', 'nullable', 'array'],
            'parts' => ['sometimes', 'nullable', 'array'],
            'metadata' => ['sometimes', 'nullable', 'array'],
        ];
    }
}
