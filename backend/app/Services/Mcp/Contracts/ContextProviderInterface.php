<?php

namespace App\Services\Mcp\Contracts;

use App\Models\User;

interface ContextProviderInterface
{
    public function build(User $user, array $options = []): array;
}
