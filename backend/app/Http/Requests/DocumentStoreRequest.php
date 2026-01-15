<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\AppliesUserCompanyRules;
use Illuminate\Foundation\Http\FormRequest;

class DocumentStoreRequest extends FormRequest
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
            'document_type' => [
                'required',
                'string',
                'max:100',
                $this->uniqueForUserCompany('documents', 'document_type')
                    ->where(fn ($query) => $query
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
