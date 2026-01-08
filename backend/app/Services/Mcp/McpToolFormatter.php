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

            $schema = $tool['input_schema'] ?? null;
            if (!is_array($schema) || $schema === []) {
                $schema = ['type' => 'object', 'properties' => []];
            }
            if (!isset($schema['type'])) {
                $schema['type'] = 'object';
            }
            if (!isset($schema['properties']) || !is_array($schema['properties'])) {
                $schema['properties'] = [];
            }

            $schema = $this->normalizeSchema($schema);

            $payload[] = [
                'type' => 'function',
                'function' => [
                    'name' => $tool['name'],
                    'description' => $tool['description'] ?? '',
                    'parameters' => $schema,
                ],
            ];
        }

        return $payload;
    }

    protected function normalizeSchema(array $schema): array
    {
        if (($schema['type'] ?? null) === 'array') {
            if (!isset($schema['items'])) {
                $schema['items'] = ['type' => 'object', 'properties' => (object) []];
            } elseif (is_array($schema['items'])) {
                $schema['items'] = $this->normalizeSchema($schema['items']);
            }
        }

        if (($schema['type'] ?? null) === 'object') {
            $properties = $schema['properties'] ?? [];
            if (!is_array($properties)) {
                $properties = [];
            }

            $normalized = [];
            foreach ($properties as $key => $value) {
                if (is_array($value)) {
                    $normalized[$key] = $this->normalizeSchema($value);
                } else {
                    $normalized[$key] = $value;
                }
            }

            if ($normalized === []) {
                $schema['properties'] = (object) [];
            } else {
                $schema['properties'] = $normalized;
            }
        }

        return $schema;
    }
}
