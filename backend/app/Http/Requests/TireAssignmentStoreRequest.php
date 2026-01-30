<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\AppliesUserCompanyRules;
use Illuminate\Foundation\Http\FormRequest;

class TireAssignmentStoreRequest extends FormRequest
{
    use AppliesUserCompanyRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tire_id' => [
                'required',
                'integer',
                $this->existsForUserCompany('tires', 'id'),
            ],
            'vehicle_id' => [
                'required',
                'integer',
                $this->existsForUserCompany('vehicles', 'id'),
            ],
            'tire_position_id' => [
                'required',
                'integer',
                $this->existsForUserCompany('tire_positions', 'id'),
            ],
            'mounted_at' => ['nullable', 'date'],
            'mounted_mileage' => ['nullable', 'integer', 'min:0'],
            'reason' => ['nullable', 'string', 'max:150'],
        ];
    }
}
