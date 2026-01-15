<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\AppliesUserCompanyRules;
use Illuminate\Foundation\Http\FormRequest;

class SparePartUpdateRequest extends FormRequest
{
    use AppliesUserCompanyRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $sparePart = $this->route('spare_part');

        return [
            'sku' => [
                'sometimes',
                'string',
                'max:120',
                $this->uniqueForUserCompany('spare_parts', 'sku', $sparePart?->id),
            ],
            'part_number' => [
                'sometimes',
                'nullable',
                'string',
                'max:120',
                $this->uniqueForUserCompany('spare_parts', 'part_number', $sparePart?->id),
            ],
            'name' => ['sometimes', 'string', 'max:150'],
            'photo_url' => ['sometimes', 'nullable', 'string'],
            'brand' => ['sometimes', 'nullable', 'string', 'max:120'],
            'category' => ['sometimes', 'nullable', 'string', 'max:120'],
            'current_stock' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'minimum_stock' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'maximum_stock' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'unit_cost' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'supplier' => ['sometimes', 'nullable', 'string', 'max:120'],
            'storage_location' => ['sometimes', 'nullable', 'string', 'max:120'],
            'status' => ['sometimes', 'nullable', 'string', 'max:50'],
            'metadata' => ['sometimes', 'nullable', 'array'],
        ];
    }
}
