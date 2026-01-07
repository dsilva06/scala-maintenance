<?php

namespace App\Services\Mcp;

use App\Services\Mcp\Contracts\ToolInterface;

class McpRegistry
{
    private array $tools = [];

    public function __construct(private readonly array $toolClasses = [])
    {
    }

    public function all(): array
    {
        if ($this->tools !== []) {
            return $this->tools;
        }

        foreach ($this->toolClasses as $toolClass) {
            $tool = app($toolClass);

            if (!$tool instanceof ToolInterface) {
                continue;
            }

            $this->tools[$tool->getName()] = $tool;
        }

        return $this->tools;
    }

    public function get(string $name): ?ToolInterface
    {
        $tools = $this->all();

        return $tools[$name] ?? null;
    }

    public function list(): array
    {
        $items = [];

        foreach ($this->all() as $tool) {
            $items[] = [
                'name' => $tool->getName(),
                'description' => $tool->getDescription(),
                'input_schema' => $tool->getInputSchema(),
            ];
        }

        return $items;
    }
}
