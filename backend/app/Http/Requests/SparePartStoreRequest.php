<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\AppliesUserCompanyRules;
use Illuminate\Foundation\Http\FormRequest;

class SparePartStoreRequest extends FormRequest
{
    use AppliesUserCompanyRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sku' => [
                'required',
                'string',
                'max:120',
                $this->uniqueForUserCompany('spare_parts', 'sku'),
            ],
            'part_number' => [
                'nullable',
                'string',
                'max:120',
                $this->uniqueForUserCompany('spare_parts', 'part_number'),
            ],
            'name' => ['required', 'string', 'max:150'],
            'photo_url' => ['nullable', 'string'],
            'brand' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'max:120'],
            'current_stock' => ['nullable', 'integer', 'min:0'],
            'minimum_stock' => ['nullable', 'integer', 'min:0'],
            'maximum_stock' => ['nullable', 'integer', 'min:0'],
            'unit_cost' => ['nullable', 'numeric', 'min:0'],
            'supplier' => ['nullable', 'string', 'max:120'],
            'storage_location' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'string', 'max:50'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
