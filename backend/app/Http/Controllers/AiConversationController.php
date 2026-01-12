<?php

namespace App\Http\Controllers;

use App\Models\AiConversation;
use App\Models\AiAction;
use App\Models\AiMessage;
use App\Models\Plan;
use App\Models\Subscription;
use App\Services\AiAgent\AiActionService;
use App\Services\AiAgent\AiAgentService;
use App\Services\Mcp\McpContextBuilder;
use App\Services\Mcp\McpRegistry;
use App\Services\Mcp\McpToolFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AiConversationController extends Controller
{
    public function __construct(
        protected AiAgentService $service,
        protected McpContextBuilder $contextBuilder,
        protected McpRegistry $registry,
        protected McpToolFormatter $toolFormatter,
        protected AiActionService $actionService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $conversations = AiConversation::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('updated_at')
            ->withCount('messages')
            ->limit(20)
            ->get(['id', 'title', 'last_message_at', 'updated_at', 'created_at', 'user_id']);

        return response()->json(['data' => $conversations]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'metadata' => ['nullable', 'array'],
        ]);

        $conversation = AiConversation::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'] ?? null,
            'metadata' => $validated['metadata'] ?? null,
            'last_message_at' => now(),
        ]);

        return response()->json(['data' => $this->serializeConversation($conversation)], 201);
    }

    public function show(Request $request, AiConversation $conversation): JsonResponse
    {
        $this->authorizeConversation($request, $conversation);

        $messages = $conversation->messages()
            ->latest()
            ->take(50)
            ->get()
            ->sortBy('created_at')
            ->values();

        return response()->json([
            'data' => [
                'conversation' => $this->serializeConversation($conversation),
                'messages' => $messages->map(fn (AiMessage $message) => $this->serializeMessage($message)),
            ],
        ]);
    }

    public function destroy(Request $request, AiConversation $conversation): JsonResponse
    {
        $this->authorizeConversation($request, $conversation);

        $conversation->delete();

        return new JsonResponse(null, 204);
    }

    public function storeMessage(Request $request, AiConversation $conversation): JsonResponse
    {
        $this->authorizeConversation($request, $conversation);

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:4000'],
            'context' => ['sometimes', 'array'],
        ]);

        $user = $request->user();

        [$plan, $subscription] = $this->resolvePlanAndSubscription($user);
        $this->enforceMessageQuota($plan, $subscription);

        $userMessage = $conversation->messages()->create([
            'user_id' => $user->id,
            'role' => 'user',
            'content' => $validated['message'],
            'status' => 'submitted',
        ]);

        $actionResponse = $this->handleActionIntent($conversation, $user, $validated['message'], $userMessage);
        if ($actionResponse) {
            $conversation->update(['last_message_at' => now()]);
            $this->incrementUsage($subscription);

            return $actionResponse;
        }

        $contextOptions = [
            'conversation' => $conversation,
            'message' => $validated['message'],
            'memory_limit' => config('services.ai_agent.memory_limit', 8),
            'operational_memory_limit' => config('services.ai_agent.operational_memory_limit', 6),
        ];

        $businessContext = $this->contextBuilder->build($user, $contextOptions);
        $context = array_merge($validated['context'] ?? [], $businessContext);

        if (config('services.ai_agent.use_tools')) {
            $context['tools'] = $this->toolFormatter->forOpenAi($this->registry->list());
        }

        $draft = $this->service->generateDraftResponse($validated['message'], $context);

        $toolCalls = $draft['metadata']['tool_calls'] ?? [];
        $actions = $this->actionService->recordToolCalls($conversation, $user, $toolCalls);

        $content = $draft['content'];
        if (trim((string) $content) === '' && $actions !== []) {
            $content = 'Tengo acciones listas para confirmar. Dime cuales deseas ejecutar.';
        }

        $assistantMessage = $conversation->messages()->create([
            'user_id' => $user->id,
            'role' => 'assistant',
            'content' => $content,
            'provider' => $draft['metadata']['provider'] ?? null,
            'model' => $draft['metadata']['model'] ?? config('services.ai_agent.model'),
            'prompt_tokens' => $draft['metadata']['prompt_tokens'] ?? 0,
            'completion_tokens' => $draft['metadata']['completion_tokens'] ?? 0,
            'status' => $draft['metadata']['status'] ?? 'completed',
            'metadata' => $draft['metadata'] ?? [],
        ]);

        $conversation->update(['last_message_at' => now()]);

        $this->incrementUsage($subscription);

        return response()->json([
            'data' => [
                'conversation' => $this->serializeConversation($conversation),
                'messages' => [
                    $this->serializeMessage($userMessage),
                    $this->serializeMessage($assistantMessage),
                ],
                'actions' => $actions,
            ],
        ], 202);
    }

    protected function authorizeConversation(Request $request, AiConversation $conversation): void
    {
        if ($conversation->user_id !== $request->user()->id) {
            abort(403, 'No autorizado.');
        }
    }

    protected function serializeConversation(AiConversation $conversation): array
    {
        return [
            'id' => $conversation->id,
            'title' => $conversation->title,
            'last_message_at' => optional($conversation->last_message_at)->toIso8601String(),
            'created_at' => $conversation->created_at->toIso8601String(),
        ];
    }

    protected function serializeMessage(AiMessage $message): array
    {
        return [
            'id' => $message->id,
            'role' => $message->role,
            'content' => $message->content,
            'provider' => $message->provider,
            'model' => $message->model,
            'status' => $message->status,
            'metadata' => $message->metadata ?? [],
            'created_at' => $message->created_at->toIso8601String(),
        ];
    }

    protected function resolvePlanAndSubscription($user): array
    {
        $subscription = Subscription::with('plan')->where('user_id', $user->id)->first();

        if ($subscription && $subscription->period_ends_at && Carbon::now()->greaterThan($subscription->period_ends_at)) {
            $subscription->update([
                'messages_used' => 0,
                'period_started_at' => Carbon::now(),
                'period_ends_at' => Carbon::now()->addMonth(),
            ]);
            $subscription->load('plan');
        }

        if (!$subscription) {
            $plan = Plan::firstOrCreate(
                ['slug' => 'free'],
                [
                    'name' => 'Free',
                    'provider' => 'openai',
                    'model' => 'gpt-4.1-mini',
                    'monthly_message_limit' => 50,
                    'features' => ['streaming' => false, 'context_messages' => 5],
                    'price_monthly' => 0,
                ]
            );

            $subscription = Subscription::create([
                'user_id' => $user->id,
                'plan_id' => $plan?->id,
                'messages_used' => 0,
                'period_started_at' => Carbon::now(),
                'period_ends_at' => Carbon::now()->addMonth(),
            ]);

            $subscription->setRelation('plan', $plan);
        }

        $plan = $subscription->plan ?? Plan::where('slug', 'free')->first();

        return [$plan, $subscription];
    }

    protected function enforceMessageQuota(?Plan $plan, Subscription $subscription): void
    {
        if (!$plan || !$plan->monthly_message_limit) {
            return;
        }

        if ($subscription->messages_used >= $plan->monthly_message_limit) {
            abort(429, 'Has alcanzado el límite de mensajes de tu plan.');
        }
    }

    protected function incrementUsage(Subscription $subscription): void
    {
        $subscription->increment('messages_used');
    }

    public function context(Request $request): JsonResponse
    {
        $options = [
            'memory_limit' => config('services.ai_agent.memory_limit', 8),
            'operational_memory_limit' => config('services.ai_agent.operational_memory_limit', 6),
        ];

        return response()->json(['data' => $this->contextBuilder->build($request->user(), $options)]);
    }

    protected function handleActionIntent(
        AiConversation $conversation,
        $user,
        string $message,
        AiMessage $userMessage
    ): ?JsonResponse {
        $intent = $this->parseActionIntent($message);

        if ($intent['type'] === 'none') {
            return null;
        }

        $pending = $conversation->actions()
            ->where('status', 'pending_confirmation')
            ->orderByDesc('created_at')
            ->get();

        if ($pending->isEmpty()) {
            $assistantMessage = $conversation->messages()->create([
                'user_id' => $user->id,
                'role' => 'assistant',
                'content' => 'No hay acciones pendientes para confirmar o cancelar.',
                'status' => 'completed',
            ]);

            return response()->json([
                'data' => [
                    'conversation' => $this->serializeConversation($conversation),
                    'messages' => [
                        $this->serializeMessage($userMessage),
                        $this->serializeMessage($assistantMessage),
                    ],
                    'actions' => [],
                ],
            ], 202);
        }

        $action = null;
        if (!empty($intent['action_id'])) {
            $action = $pending->firstWhere('id', $intent['action_id']);
        } else {
            $action = $pending->first();
        }

        if (!$action) {
            $assistantMessage = $conversation->messages()->create([
                'user_id' => $user->id,
                'role' => 'assistant',
                'content' => 'Hay varias acciones pendientes. Indica el ID o confirma desde el panel de acciones.',
                'status' => 'completed',
                'metadata' => [
                    'status' => 'needs_action_id',
                ],
            ]);

            return response()->json([
                'data' => [
                    'conversation' => $this->serializeConversation($conversation),
                    'messages' => [
                        $this->serializeMessage($userMessage),
                        $this->serializeMessage($assistantMessage),
                    ],
                    'actions' => $pending->map(fn (AiAction $item) => $this->serializeAction($item))->all(),
                ],
            ], 202);
        }

        if ($intent['type'] === 'confirm') {
            $action = $this->actionService->confirm($action, $user);
        } else {
            $action = $this->actionService->cancel($action);
        }

        $assistantMessage = $conversation->messages()->create([
            'user_id' => $user->id,
            'role' => 'assistant',
            'content' => $this->formatActionSummary($action),
            'status' => 'completed',
            'metadata' => [
                'status' => $action->status,
                'tool' => $action->tool,
                'action_id' => $action->id,
            ],
        ]);

        return response()->json([
            'data' => [
                'conversation' => $this->serializeConversation($conversation),
                'messages' => [
                    $this->serializeMessage($userMessage),
                    $this->serializeMessage($assistantMessage),
                ],
                'actions' => [$this->serializeAction($action)],
            ],
        ], 202);
    }

    protected function parseActionIntent(string $message): array
    {
        $normalized = strtolower(trim($message));
        $normalized = preg_replace('/\\s+/', ' ', $normalized) ?? '';

        $confirmKeywords = [
            'confirmo', 'confirmar', 'confirmacion', 'si', 'sí', 'dale', 'ok', 'vale', 'hazlo', 'ejecuta', 'ejecutar',
            'adelante', 'aplicar',
        ];
        $cancelKeywords = ['cancela', 'cancelar', 'detener', 'deten', 'parar', 'cancelado'];

        $actionId = null;
        if (preg_match('/\\baccion\\s*#?\\s*(\\d+)\\b/', $normalized, $matches)) {
            $actionId = (int) $matches[1];
        } elseif (preg_match('/#(\\d+)/', $normalized, $matches)) {
            $actionId = (int) $matches[1];
        }

        foreach ($confirmKeywords as $keyword) {
            if (strpos($normalized, $keyword) !== false) {
                return ['type' => 'confirm', 'action_id' => $actionId];
            }
        }

        foreach ($cancelKeywords as $keyword) {
            if (strpos($normalized, $keyword) !== false) {
                return ['type' => 'cancel', 'action_id' => $actionId];
            }
        }

        return ['type' => 'none', 'action_id' => null];
    }

    protected function formatActionSummary(AiAction $action): string
    {
        if ($action->status === 'executed') {
            return "Accion ejecutada: {$action->tool}.";
        }

        if ($action->status === 'cancelled') {
            return "Accion cancelada: {$action->tool}.";
        }

        if ($action->status === 'failed') {
            $error = $action->error ? " Motivo: {$action->error}" : '';
            return "No se pudo ejecutar la accion: {$action->tool}.{$error}";
        }

        return "Accion registrada: {$action->tool}.";
    }

    protected function serializeAction(AiAction $action): array
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
