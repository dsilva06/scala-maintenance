<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\AppliesUserCompanyRules;
use Illuminate\Foundation\Http\FormRequest;

class MaintenanceOrderStoreRequest extends FormRequest
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
                'nullable',
                $this->existsForUserCompany('vehicles', 'id'),
            ],
            'order_number' => [
                'required',
                'string',
                'max:120',
                $this->uniqueForUserCompany('maintenance_orders', 'order_number'),
            ],
            'type' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'string', 'max:50'],
            'priority' => ['nullable', 'string', 'max:50'],
            'title' => ['nullable', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'mechanic' => ['nullable', 'string', 'max:120'],
            'scheduled_date' => ['nullable', 'date'],
            'completion_date' => ['nullable', 'date'],
            'completion_mileage' => ['nullable', 'integer', 'min:0'],
            'estimated_cost' => ['nullable', 'numeric', 'min:0'],
            'actual_cost' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'tasks' => ['nullable', 'array'],
            'parts' => ['nullable', 'array'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
