<?php

namespace App\Services\Mcp;

use App\Models\User;
use App\Services\Mcp\Contracts\ContextProviderInterface;

class McpContextBuilder
{
    public function __construct(private readonly array $providerClasses = [])
    {
    }

    public function build(User $user, array $options = []): array
    {
        $context = [];

        foreach ($this->providerClasses as $providerClass) {
            $provider = app($providerClass);

            if (!$provider instanceof ContextProviderInterface) {
                continue;
            }

            $context = array_merge($context, $provider->build($user, $options));
        }

        return $context;
    }
}
