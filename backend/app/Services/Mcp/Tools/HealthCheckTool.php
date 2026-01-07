<?php

namespace App\Services\Mcp\Tools;

use App\Models\User;
use App\Services\Mcp\Contracts\ToolInterface;
use Illuminate\Support\Carbon;

class HealthCheckTool implements ToolInterface
{
    public function getName(): string
    {
        return 'health_check';
    }

    public function getDescription(): string
    {
        return 'Verifica que el servidor MCP esta disponible.';
    }

    public function getInputSchema(): array
    {
        return [
            'type' => 'object',
            'properties' => [],
        ];
    }

    public function validateArguments(array $arguments, User $user): array
    {
        return [];
    }

    public function invoke(array $arguments, User $user): array
    {
        return [
            'ok' => true,
            'user_id' => $user->id,
            'timestamp' => Carbon::now()->toIso8601String(),
        ];
    }
}
