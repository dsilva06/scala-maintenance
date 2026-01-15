<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class McpInvokeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'arguments' => ['nullable', 'array'],
        ];
    }
}
