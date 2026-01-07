<?php

namespace App\Services\Mcp\Contracts;

use App\Models\User;

interface ToolInterface
{
    public function getName(): string;

    public function getDescription(): string;

    public function getInputSchema(): array;

    public function validateArguments(array $arguments, User $user): array;

    public function invoke(array $arguments, User $user): array;
}
