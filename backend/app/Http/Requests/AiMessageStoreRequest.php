<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AiMessageStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'max:4000'],
            'context' => ['sometimes', 'array'],
        ];
    }
}
