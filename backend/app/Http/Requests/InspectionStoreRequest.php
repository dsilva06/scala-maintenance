<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InspectionStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => ['required', 'exists:vehicles,id'],
            'inspection_date' => ['required', 'date'],
            'inspector' => ['required', 'string', 'max:120'],
            'mileage' => ['required', 'integer', 'min:0'],
            'overall_status' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
            'checklist_items' => ['required', 'array'],
            'checklist_items.*.category' => ['required', 'string', 'max:120'],
            'checklist_items.*.item' => ['required', 'string', 'max:150'],
            'checklist_items.*.status' => ['required', 'string', 'max:50'],
            'checklist_items.*.notes' => ['nullable', 'string'],
            'checklist_items.*.evidence' => ['nullable', 'array'],
            'checklist_items.*.evidence.*.file_url' => ['nullable', 'string'],
            'checklist_items.*.evidence.*.file_name' => ['nullable', 'string', 'max:255'],
            'checklist_items.*.evidence.*.comment' => ['nullable', 'string'],
            'checklist_items.*.evidence.*.numeric_value' => ['nullable', 'numeric'],
            'checklist_items.*.evidence.*.ai_suggestion' => ['nullable', 'string'],
            'checklist_items.*.evidence.*.ai_status' => ['nullable', 'string', 'max:50'],
            'attachments' => ['nullable', 'array'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
