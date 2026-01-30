<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\AppliesUserCompanyRules;
use Illuminate\Foundation\Http\FormRequest;

class TireUpdateRequest extends FormRequest
{
    use AppliesUserCompanyRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tire = $this->route('tire');

        return [
            'serial' => [
                'sometimes',
                'string',
                'max:120',
                $this->uniqueForUserCompany('tires', 'serial', $tire?->id),
            ],
            'tire_type_id' => [
                'sometimes',
                'integer',
                $this->existsForUserCompany('tire_types', 'id'),
            ],
            'purchase_date' => ['sometimes', 'nullable', 'date'],
            'purchase_cost' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'depth_new_mm' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'min_depth_mm' => ['sometimes', 'numeric', 'min:0'],
            'status' => ['sometimes', 'nullable', 'string', 'max:50'],
            'notes' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
