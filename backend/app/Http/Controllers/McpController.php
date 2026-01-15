<?php

namespace App\Http\Controllers;

use App\Http\Requests\McpInvokeRequest;
use App\Services\Mcp\McpServer;
use Illuminate\Http\JsonResponse;

class McpController extends Controller
{
    public function index(McpServer $server): JsonResponse
    {
        $this->ensureEnabled();

        return response()->json([
            'data' => $server->listTools(),
        ]);
    }

    public function invoke(McpInvokeRequest $request, McpServer $server, string $tool): JsonResponse
    {
        $this->ensureEnabled();

        $validated = $request->validated();

        $result = $server->callTool($tool, $validated['arguments'] ?? [], $request->user());

        return response()->json(['data' => $result]);
    }

    protected function ensureEnabled(): void
    {
        if (!config('mcp.enabled')) {
            abort(404);
        }
    }
}
