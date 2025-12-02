<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InspectionUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => ['sometimes', 'nullable', 'exists:vehicles,id'],
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
            'attachments' => ['sometimes', 'nullable', 'array'],
            'metadata' => ['sometimes', 'nullable', 'array'],
        ];
    }
}
