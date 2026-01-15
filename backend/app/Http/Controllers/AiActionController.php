<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\AuthorizesCompanyResource;
use App\Models\AiAction;
use App\Models\AiConversation;
use App\Services\AiAgent\AiActionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiActionController extends Controller
{
    use AuthorizesCompanyResource;

    public function index(Request $request, AiConversation $conversation): JsonResponse
    {
        $this->authorizeCompanyRead($request, $conversation);

        $actions = $conversation->actions()
            ->latest()
            ->take(50)
            ->get()
            ->map(fn (AiAction $action) => $this->serialize($action));

        return response()->json(['data' => $actions]);
    }

    public function confirm(Request $request, AiAction $action, AiActionService $service): JsonResponse
    {
        $this->authorizeCompanyRead($request, $action);

        $action = $service->confirm($action, $request->user());

        return response()->json(['data' => $this->serialize($action)]);
    }

    public function cancel(Request $request, AiAction $action, AiActionService $service): JsonResponse
    {
        $this->authorizeCompanyRead($request, $action);

        $action = $service->cancel($action);

        return response()->json(['data' => $this->serialize($action)]);
    }

    protected function serialize(AiAction $action): array
    {
        return [
            'id' => $action->id,
            'tool' => $action->tool,
            'status' => $action->status,
            'requires_confirmation' => $action->requires_confirmation,
            'arguments' => $action->arguments,
            'result' => $action->result,
            'error' => $action->error,
            'confirmed_at' => optional($action->confirmed_at)->toIso8601String(),
            'executed_at' => optional($action->executed_at)->toIso8601String(),
            'cancelled_at' => optional($action->cancelled_at)->toIso8601String(),
        ];
    }
}
