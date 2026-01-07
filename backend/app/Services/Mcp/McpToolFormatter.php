<?php

namespace App\Services\Mcp;

class McpToolFormatter
{
    public function forOpenAi(array $tools): array
    {
        $payload = [];

        foreach ($tools as $tool) {
            if (empty($tool['name'])) {
                continue;
            }

            $payload[] = [
                'type' => 'function',
                'function' => [
                    'name' => $tool['name'],
                    'description' => $tool['description'] ?? '',
                    'parameters' => $tool['input_schema'] ?? ['type' => 'object', 'properties' => []],
                ],
            ];
        }

        return $payload;
    }
}
