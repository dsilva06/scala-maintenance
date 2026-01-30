<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\AppliesUserCompanyRules;
use Illuminate\Foundation\Http\FormRequest;

class TireTypeUpdateRequest extends FormRequest
{
    use AppliesUserCompanyRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:150'],
            'brand' => ['sometimes', 'nullable', 'string', 'max:150'],
            'model' => ['sometimes', 'nullable', 'string', 'max:150'],
            'size' => ['sometimes', 'nullable', 'string', 'max:120'],
            'usage' => ['sometimes', 'nullable', 'string', 'in:directional,traction'],
            'pressure_target_psi' => ['sometimes', 'numeric', 'min:0'],
            'pressure_tolerance_pct' => ['sometimes', 'integer', 'min:1', 'max:50'],
            'notes' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
