<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MaintenanceOrderStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()?->id;

        return [
            'vehicle_id' => ['nullable', 'exists:vehicles,id'],
            'order_number' => [
                'required',
                'string',
                'max:120',
                Rule::unique('maintenance_orders', 'order_number')->where('user_id', $userId),
            ],
            'type' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'string', 'max:50'],
            'priority' => ['nullable', 'string', 'max:50'],
            'title' => ['nullable', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'mechanic' => ['nullable', 'string', 'max:120'],
            'scheduled_date' => ['nullable', 'date'],
            'completion_date' => ['nullable', 'date'],
            'estimated_cost' => ['nullable', 'numeric', 'min:0'],
            'actual_cost' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'tasks' => ['nullable', 'array'],
            'parts' => ['nullable', 'array'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
