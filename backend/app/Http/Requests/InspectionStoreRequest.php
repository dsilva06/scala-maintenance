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
            'attachments' => ['nullable', 'array'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
