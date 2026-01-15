<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AnalyticsEventStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $maxEvents = (int) config('analytics.max_events', 100);

        return [
            'events' => ['required', 'array', 'min:1', 'max:' . $maxEvents],
            'events.*.name' => ['required', 'string', 'max:120'],
            'events.*.category' => ['nullable', 'string', 'max:80'],
            'events.*.entity_type' => ['nullable', 'string', 'max:80'],
            'events.*.entity_id' => ['nullable', 'integer'],
            'events.*.occurred_at' => ['nullable', 'date'],
            'events.*.payload' => ['nullable', 'array'],
            'events.*.metadata' => ['nullable', 'array'],
            'events.*.source' => ['nullable', 'string', 'max:80'],
        ];
    }
}
