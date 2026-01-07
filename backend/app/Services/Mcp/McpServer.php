<?php

namespace App\Services\Mcp;

use App\Models\User;
use Illuminate\Validation\ValidationException;

class McpServer
{
    public function __construct(private readonly McpRegistry $registry)
    {
    }

    public function listTools(): array
    {
        return $this->registry->list();
    }

    public function callTool(string $name, array $arguments, User $user): array
    {
        $tool = $this->registry->get($name);

        if (!$tool) {
            throw ValidationException::withMessages([
                'tool' => ["Tool '{$name}' no encontrado."],
            ]);
        }

        $validated = $tool->validateArguments($arguments, $user);

        return $tool->invoke($validated, $user);
    }
}
