<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DocumentUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $document = $this->route('document');
        $userId = $this->user()?->id;
        $vehicleId = $this->input('vehicle_id', $document?->vehicle_id);

        return [
            'vehicle_id' => ['sometimes', 'nullable', 'exists:vehicles,id'],
            'document_type' => [
                'sometimes',
                'string',
                'max:100',
                Rule::unique('documents', 'document_type')
                    ->ignore($document?->id)
                    ->where(fn ($query) => $query
                        ->where('user_id', $userId)
                        ->where('vehicle_id', $vehicleId)),
            ],
            'document_number' => ['sometimes', 'nullable', 'string', 'max:150'],
            'issuing_entity' => ['sometimes', 'nullable', 'string', 'max:150'],
            'issue_date' => ['sometimes', 'nullable', 'date'],
            'expiration_date' => ['sometimes', 'nullable', 'date'],
            'alert_days_before' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'status' => ['sometimes', 'nullable', 'string', 'max:50'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'metadata' => ['sometimes', 'nullable', 'array'],
        ];
    }
}
