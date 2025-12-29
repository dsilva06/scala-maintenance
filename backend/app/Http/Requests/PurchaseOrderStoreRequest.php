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
            'supplier' => ['required', 'string', 'max:150'],
            'status' => ['nullable', 'string', 'max:50'],
            'priority' => ['nullable', 'string', 'max:50'],
            'total_cost' => ['nullable', 'numeric', 'min:0'],
            'items_count' => ['nullable', 'integer', 'min:0'],
            'expected_date' => ['nullable', 'date', 'after_or_equal:today'],
            'notes' => ['nullable', 'string'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
