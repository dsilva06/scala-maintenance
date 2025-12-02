<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AlertUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['sometimes', 'string', 'max:100'],
            'severity' => ['sometimes', 'string', 'max:50'],
            'title' => ['sometimes', 'string', 'max:150'],
            'description' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', 'string', 'max:50'],
            'related_type' => ['sometimes', 'nullable', 'string', 'max:150'],
            'related_id' => ['sometimes', 'nullable', 'integer'],
            'action_data' => ['sometimes', 'nullable', 'array'],
            'resolved_by' => ['sometimes', 'nullable', 'string', 'max:120'],
            'resolved_at' => ['sometimes', 'nullable', 'date'],
            'metadata' => ['sometimes', 'nullable', 'array'],
        ];
    }
}
