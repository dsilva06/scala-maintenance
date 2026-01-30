<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\AppliesUserCompanyRules;
use Illuminate\Foundation\Http\FormRequest;

class InspectionUpdateRequest extends FormRequest
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
                'sometimes',
                'nullable',
                $this->existsForUserCompany('vehicles', 'id'),
            ],
            'inspection_date' => ['sometimes', 'date'],
            'inspector' => ['sometimes', 'string', 'max:120'],
            'mileage' => ['sometimes', 'integer', 'min:0'],
            'overall_status' => ['sometimes', 'string', 'max:50'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'checklist_items' => ['sometimes', 'array'],
            'checklist_items.*.category' => ['required_with:checklist_items', 'string', 'max:120'],
            'checklist_items.*.item' => ['required_with:checklist_items', 'string', 'max:150'],
            'checklist_items.*.status' => ['required_with:checklist_items', 'string', 'max:50'],
            'checklist_items.*.notes' => ['nullable', 'string'],
            'checklist_items.*.evidence' => ['nullable', 'array'],
            'checklist_items.*.evidence.*.file_url' => ['nullable', 'string'],
            'checklist_items.*.evidence.*.file_name' => ['nullable', 'string', 'max:255'],
            'checklist_items.*.evidence.*.comment' => ['nullable', 'string'],
            'checklist_items.*.evidence.*.numeric_value' => ['nullable', 'numeric'],
            'checklist_items.*.evidence.*.ai_suggestion' => ['nullable', 'string'],
            'checklist_items.*.evidence.*.ai_status' => ['nullable', 'string', 'max:50'],
            'attachments' => ['sometimes', 'nullable', 'array'],
            'tire_checks' => ['sometimes', 'nullable', 'array'],
            'tire_checks.*.tire_position_id' => [
                'required_with:tire_checks',
                'integer',
                $this->existsForUserCompany('tire_positions', 'id'),
            ],
            'tire_checks.*.tire_id' => [
                'nullable',
                'integer',
                $this->existsForUserCompany('tires', 'id'),
            ],
            'tire_checks.*.tire_serial' => ['nullable', 'string', 'max:120'],
            'tire_checks.*.tire_type_id' => [
                'nullable',
                'integer',
                $this->existsForUserCompany('tire_types', 'id'),
            ],
            'tire_checks.*.min_depth_mm' => ['nullable', 'numeric', 'min:0'],
            'tire_checks.*.depth_new_mm' => ['nullable', 'numeric', 'min:0'],
            'tire_checks.*.pressure_psi' => ['nullable', 'numeric', 'min:0'],
            'tire_checks.*.depth_mm' => ['nullable', 'numeric', 'min:0'],
            'tire_checks.*.notes' => ['nullable', 'string'],
            'metadata' => ['sometimes', 'nullable', 'array'],
        ];
    }
}
