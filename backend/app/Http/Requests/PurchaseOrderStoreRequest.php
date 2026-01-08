<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PurchaseOrderStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()?->id;

        return [
            'order_number' => [
                'required',
                'string',
                'max:120',
                Rule::unique('purchase_orders', 'order_number')->where('user_id', $userId),
            ],
            'product_name' => ['required', 'string', 'max:150'],
            'supplier' => ['required_without:supplier_id', 'string', 'max:150'],
            'supplier_id' => [
                'nullable',
                'integer',
                Rule::exists('suppliers', 'id')->where('user_id', $userId),
            ],
            'status' => ['nullable', 'string', 'max:50'],
            'priority' => ['nullable', 'string', 'max:50'],
            'total_cost' => ['nullable', 'numeric', 'min:0'],
            'items_count' => ['nullable', 'integer', 'min:0'],
            'expected_date' => ['nullable', 'date', 'after_or_equal:today'],
            'spare_part_id' => [
                'nullable',
                'integer',
                Rule::exists('spare_parts', 'id')->where('user_id', $userId),
            ],
            'notes' => ['nullable', 'string'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
