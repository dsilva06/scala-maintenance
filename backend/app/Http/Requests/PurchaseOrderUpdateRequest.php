<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\AppliesUserCompanyRules;
use Illuminate\Foundation\Http\FormRequest;

class PurchaseOrderUpdateRequest extends FormRequest
{
    use AppliesUserCompanyRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $purchaseOrder = $this->route('purchase_order');

        return [
            'order_number' => [
                'sometimes',
                'string',
                'max:120',
                $this->uniqueForUserCompany('purchase_orders', 'order_number', $purchaseOrder?->id),
            ],
            'product_name' => ['sometimes', 'nullable', 'string', 'max:150'],
            'supplier' => ['sometimes', 'nullable', 'string', 'max:150'],
            'supplier_id' => [
                'sometimes',
                'nullable',
                'integer',
                $this->existsForUserCompany('suppliers', 'id'),
            ],
            'status' => ['sometimes', 'string', 'max:50'],
            'priority' => ['sometimes', 'string', 'max:50'],
            'total_cost' => ['sometimes', 'numeric', 'min:0'],
            'items_count' => ['sometimes', 'integer', 'min:0'],
            'expected_date' => ['sometimes', 'nullable', 'date'],
            'spare_part_id' => [
                'sometimes',
                'nullable',
                'integer',
                $this->existsForUserCompany('spare_parts', 'id'),
            ],
            'items' => ['sometimes', 'nullable', 'array'],
            'items.*.spare_part_id' => [
                'nullable',
                'integer',
                $this->existsForUserCompany('spare_parts', 'id'),
            ],
            'items.*.product_name' => ['nullable', 'string', 'max:150'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
            'items.*.unit_cost' => ['nullable', 'numeric', 'min:0'],
            'items.*.total_cost' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'metadata' => ['sometimes', 'nullable', 'array'],
        ];
    }
}
