<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\AppliesUserCompanyRules;
use Illuminate\Foundation\Http\FormRequest;

class TelemetryIngestRequest extends FormRequest
{
    use AppliesUserCompanyRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $maxPoints = (int) config('fleet.telemetry.max_points', 200);

        return [
            'vehicle_id' => [
                'nullable',
                'integer',
                $this->existsForUserCompany('vehicles', 'id'),
            ],
            'trip_id' => [
                'nullable',
                'integer',
                $this->existsForUserCompany('trips', 'id'),
            ],
            'points' => ['required', 'array', 'min:1', 'max:' . $maxPoints],
            'points.*.lat' => ['required', 'numeric', 'between:-90,90'],
            'points.*.lng' => ['required', 'numeric', 'between:-180,180'],
            'points.*.speed_kph' => ['nullable', 'numeric', 'min:0'],
            'points.*.heading' => ['nullable', 'numeric', 'between:0,360'],
            'points.*.altitude' => ['nullable', 'numeric'],
            'points.*.accuracy' => ['nullable', 'numeric', 'min:0'],
            'points.*.recorded_at' => ['nullable', 'date'],
            'points.*.metadata' => ['nullable', 'array'],
            'source' => ['nullable', 'string', 'max:80'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (!$this->input('vehicle_id') && !$this->input('trip_id')) {
                $validator->errors()->add('target', 'Se requiere vehicle_id o trip_id.');
            }
        });
    }
}
