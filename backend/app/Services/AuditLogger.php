<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class AuditLogger
{
    public function record(User $user, string $action, ?Model $model = null, array $before = [], array $after = [], array $metadata = []): void
    {
        $request = app()->bound('request') ? app('request') : new Request();

        $context = [
            'request_id' => $request->headers->get('X-Request-Id'),
            'path' => $request->path(),
            'method' => $request->method() ?: null,
        ];

        AuditLog::create([
            'company_id' => $user->company_id,
            'user_id' => $user->id,
            'auditable_type' => $model?->getMorphClass(),
            'auditable_id' => $model?->getKey(),
            'action' => $action,
            'before' => $before,
            'after' => $after,
            'metadata' => array_merge($context, $metadata),
            'ip_address' => $request->ip(),
            'user_agent' => $this->truncate((string) $request->userAgent(), 255),
        ]);
    }

    public function snapshot(Model $model, array $exclude = []): array
    {
        $payload = $model->getAttributes();

        if ($exclude !== []) {
            $payload = Arr::except($payload, $exclude);
        }

        return $payload;
    }

    protected function truncate(string $value, int $limit): string
    {
        if (strlen($value) <= $limit) {
            return $value;
        }

        return substr($value, 0, $limit);
    }
}
