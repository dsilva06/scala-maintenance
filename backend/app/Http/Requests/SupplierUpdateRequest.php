<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\AppliesUserCompanyRules;
use Illuminate\Foundation\Http\FormRequest;

class SupplierUpdateRequest extends FormRequest
{
    use AppliesUserCompanyRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $supplier = $this->route('supplier');

        return [
            'name' => [
                'sometimes',
                'string',
                'max:150',
                $this->uniqueForUserCompany('suppliers', 'name', $supplier?->id),
            ],
            'contact_name' => ['sometimes', 'nullable', 'string', 'max:150'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'email' => ['sometimes', 'nullable', 'string', 'max:150'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'metadata' => ['sometimes', 'nullable', 'array'],
        ];
    }
}
