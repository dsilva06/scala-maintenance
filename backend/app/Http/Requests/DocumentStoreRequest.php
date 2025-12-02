<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DocumentStoreRequest extends FormRequest
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
            'document_type' => [
                'required',
                'string',
                'max:100',
                Rule::unique('documents', 'document_type')
                    ->where(fn ($query) => $query
                        ->where('user_id', $userId)
                        ->where('vehicle_id', $this->input('vehicle_id'))),
            ],
            'document_number' => ['nullable', 'string', 'max:150'],
            'issuing_entity' => ['nullable', 'string', 'max:150'],
            'issue_date' => ['nullable', 'date'],
            'expiration_date' => ['required', 'date'],
            'alert_days_before' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
