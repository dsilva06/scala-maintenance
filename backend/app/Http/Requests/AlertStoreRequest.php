<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AlertStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'string', 'max:100'],
            'severity' => ['nullable', 'string', 'max:50'],
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'max:50'],
            'related_type' => ['nullable', 'string', 'max:150'],
            'related_id' => ['nullable', 'integer'],
            'action_data' => ['nullable', 'array'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
