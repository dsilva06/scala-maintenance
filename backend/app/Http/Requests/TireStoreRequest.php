<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\AppliesUserCompanyRules;
use Illuminate\Foundation\Http\FormRequest;

class TireStoreRequest extends FormRequest
{
    use AppliesUserCompanyRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'serial' => [
                'required',
                'string',
                'max:120',
                $this->uniqueForUserCompany('tires', 'serial'),
            ],
            'tire_type_id' => [
                'required',
                'integer',
                $this->existsForUserCompany('tire_types', 'id'),
            ],
            'purchase_date' => ['nullable', 'date'],
            'purchase_cost' => ['nullable', 'numeric', 'min:0'],
            'depth_new_mm' => ['nullable', 'numeric', 'min:0'],
            'min_depth_mm' => ['required', 'numeric', 'min:0'],
            'status' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
