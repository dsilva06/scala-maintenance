<?php

return [
    'enabled' => env('MCP_ENABLED', false),
    'tools' => [
        App\Services\Mcp\Tools\HealthCheckTool::class,
        App\Services\Mcp\Tools\CreateMaintenanceOrderTool::class,
        App\Services\Mcp\Tools\UpdateMaintenanceOrderTool::class,
        App\Services\Mcp\Tools\CreatePurchaseOrderTool::class,
        App\Services\Mcp\Tools\CreateAlertTool::class,
        App\Services\Mcp\Tools\UpdateSparePartStockTool::class,
        App\Services\Mcp\Tools\CreateVehicleTool::class,
    ],
    'context_providers' => [
        App\Services\Mcp\Context\BusinessContextProvider::class,
        App\Services\Mcp\Context\ConversationMemoryProvider::class,
        App\Services\Mcp\Context\OperationalMemoryProvider::class,
        App\Services\Mcp\Context\SystemSearchProvider::class,
        App\Services\Mcp\Context\PolicyContextProvider::class,
    ],
];
