<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\AppliesUserCompanyRules;
use Illuminate\Foundation\Http\FormRequest;

class TireTypeStoreRequest extends FormRequest
{
    use AppliesUserCompanyRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'brand' => ['nullable', 'string', 'max:150'],
            'model' => ['nullable', 'string', 'max:150'],
            'size' => ['nullable', 'string', 'max:120'],
            'usage' => ['nullable', 'string', 'in:directional,traction'],
            'pressure_target_psi' => ['required', 'numeric', 'min:0'],
            'pressure_tolerance_pct' => ['nullable', 'integer', 'min:1', 'max:50'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
