<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SparePartStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()?->id;

        return [
            'sku' => [
                'required',
                'string',
                'max:120',
                Rule::unique('spare_parts', 'sku')->where('user_id', $userId),
            ],
            'part_number' => [
                'nullable',
                'string',
                'max:120',
                Rule::unique('spare_parts', 'part_number')->where('user_id', $userId),
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
