<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\AppliesUserCompanyRules;
use Illuminate\Foundation\Http\FormRequest;

class PurchaseOrderStoreRequest extends FormRequest
{
    use AppliesUserCompanyRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_number' => [
                'required',
                'string',
                'max:120',
                $this->uniqueForUserCompany('purchase_orders', 'order_number'),
            ],
            'product_name' => ['required', 'string', 'max:150'],
            'supplier' => ['required_without:supplier_id', 'string', 'max:150'],
            'supplier_id' => [
                'nullable',
                'integer',
                $this->existsForUserCompany('suppliers', 'id'),
            ],
            'status' => ['nullable', 'string', 'max:50'],
            'priority' => ['nullable', 'string', 'max:50'],
            'total_cost' => ['nullable', 'numeric', 'min:0'],
            'items_count' => ['nullable', 'integer', 'min:0'],
            'expected_date' => ['nullable', 'date', 'after_or_equal:today'],
            'spare_part_id' => [
                'nullable',
                'integer',
                $this->existsForUserCompany('spare_parts', 'id'),
            ],
            'notes' => ['nullable', 'string'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
