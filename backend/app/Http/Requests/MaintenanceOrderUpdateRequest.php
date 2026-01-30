<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\AppliesUserCompanyRules;
use Illuminate\Foundation\Http\FormRequest;

class MaintenanceOrderUpdateRequest extends FormRequest
{
    use AppliesUserCompanyRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $maintenanceOrder = $this->route('maintenanceOrder');

        return [
            'vehicle_id' => [
                'sometimes',
                'nullable',
                $this->existsForUserCompany('vehicles', 'id'),
            ],
            'order_number' => [
                'sometimes',
                'string',
                'max:120',
                $this->uniqueForUserCompany('maintenance_orders', 'order_number', $maintenanceOrder?->id),
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

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $status = $this->input('status');
            $completionMileage = $this->input('completion_mileage');

            if ($status === 'completada' && ($completionMileage === null || $completionMileage === '')) {
                $validator->errors()->add('completion_mileage', 'El kilometraje es obligatorio al completar la orden.');
            }
        });
    }
}
