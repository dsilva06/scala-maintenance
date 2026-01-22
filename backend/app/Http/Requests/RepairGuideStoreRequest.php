<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\AppliesUserCompanyRules;
use Illuminate\Foundation\Http\FormRequest;

class RepairGuideStoreRequest extends FormRequest
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
                'required',
                'integer',
                $this->existsForUserCompany('vehicles', 'id'),
            ],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', 'string', 'max:50'],
            'priority' => ['nullable', 'string', 'max:50'],
            'difficulty' => ['nullable', 'string', 'max:50'],
            'estimated_time_hours' => ['nullable', 'numeric', 'min:0'],
            'steps' => ['required', 'array', 'min:1'],
            'steps.*.step_number' => ['required', 'integer', 'min:1'],
            'steps.*.title' => ['nullable', 'string', 'max:150'],
            'steps.*.description' => ['nullable', 'string'],
            'required_parts' => ['nullable', 'array'],
            'required_parts.*.part_id' => ['nullable', 'integer'],
            'required_parts.*.quantity_needed' => ['nullable', 'integer', 'min:1'],
            'required_parts.*.is_critical' => ['nullable', 'boolean'],
            'keywords' => ['nullable', 'array'],
            'keywords.*' => ['string'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
