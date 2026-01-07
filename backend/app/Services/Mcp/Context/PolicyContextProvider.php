<?php

namespace App\Services\Mcp\Context;

use App\Models\User;
use App\Services\Mcp\Contracts\ContextProviderInterface;

class PolicyContextProvider implements ContextProviderInterface
{
    public function build(User $user, array $options = []): array
    {
        $rules = config('ai_policies.rules', []);
        $thresholds = config('ai_policies.thresholds', []);

        $summaryLines = [];
        foreach ($rules as $rule) {
            if (!empty($rule['description'])) {
                $summaryLines[] = $rule['description'];
            }
        }

        return [
            'policies' => [
                'thresholds' => $thresholds,
                'rules' => $rules,
                'summary' => implode("\n", $summaryLines),
            ],
        ];
    }
}
