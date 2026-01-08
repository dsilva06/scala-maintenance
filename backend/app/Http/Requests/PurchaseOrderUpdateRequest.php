<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PurchaseOrderUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $purchaseOrder = $this->route('purchase_order');
        $userId = $this->user()?->id;

        return [
            'order_number' => [
                'sometimes',
                'string',
                'max:120',
                Rule::unique('purchase_orders', 'order_number')
                    ->where('user_id', $userId)
                    ->ignore($purchaseOrder?->id),
            ],
            'product_name' => ['sometimes', 'string', 'max:150'],
            'supplier' => ['sometimes', 'nullable', 'string', 'max:150'],
            'supplier_id' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists('suppliers', 'id')->where('user_id', $userId),
            ],
            'status' => ['sometimes', 'string', 'max:50'],
            'priority' => ['sometimes', 'string', 'max:50'],
            'total_cost' => ['sometimes', 'numeric', 'min:0'],
            'items_count' => ['sometimes', 'integer', 'min:0'],
            'expected_date' => ['sometimes', 'nullable', 'date', 'after_or_equal:today'],
            'spare_part_id' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists('spare_parts', 'id')->where('user_id', $userId),
            ],
            'notes' => ['sometimes', 'nullable', 'string'],
            'metadata' => ['sometimes', 'nullable', 'array'],
        ];
    }
}
