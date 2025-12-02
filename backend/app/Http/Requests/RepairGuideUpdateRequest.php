<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RepairGuideUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:150'],
            'description' => ['sometimes', 'string', 'max:255'],
            'category' => ['sometimes', 'nullable', 'string', 'max:100'],
            'type' => ['sometimes', 'nullable', 'string', 'max:50'],
            'priority' => ['sometimes', 'nullable', 'string', 'max:50'],
            'difficulty' => ['sometimes', 'nullable', 'string', 'max:50'],
            'estimated_time_hours' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'steps' => ['sometimes', 'array', 'min:1'],
            'steps.*.step_number' => ['required_with:steps', 'integer', 'min:1'],
            'steps.*.title' => ['nullable', 'string', 'max:150'],
            'steps.*.description' => ['nullable', 'string'],
            'required_parts' => ['sometimes', 'nullable', 'array'],
            'required_parts.*.part_id' => ['nullable', 'string'],
            'required_parts.*.quantity_needed' => ['nullable', 'integer', 'min:1'],
            'required_parts.*.is_critical' => ['nullable', 'boolean'],
            'keywords' => ['sometimes', 'nullable', 'array'],
            'keywords.*' => ['string'],
            'metadata' => ['sometimes', 'nullable', 'array'],
        ];
    }
}
