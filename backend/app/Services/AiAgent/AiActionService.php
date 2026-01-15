<?php

namespace App\Services\AiAgent;

use App\Models\AiAction;
use App\Models\AiConversation;
use App\Models\User;
use App\Services\Mcp\McpRegistry;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;

class AiActionService
{
    public function __construct(
        private readonly McpRegistry $registry,
        private readonly AiMemoryService $memoryService
    )
    {
    }

    public function recordToolCalls(AiConversation $conversation, User $user, array $toolCalls): array
    {
        if ($toolCalls === []) {
            return [];
        }

        $actions = [];

        foreach ($toolCalls as $call) {
            $actions[] = $this->recordToolCall($conversation, $user, $call);
        }

        return array_values(array_filter($actions));
    }

    public function confirm(AiAction $action, User $user): AiAction
    {
        if ($action->status !== 'pending_confirmation') {
            throw ValidationException::withMessages([
                'status' => ['La accion no esta pendiente de confirmacion.'],
            ]);
        }

        $tool = $this->registry->get($action->tool);

        if (!$tool) {
            $action->update([
                'status' => 'failed',
                'error' => "Tool '{$action->tool}' no encontrado.",
                'confirmed_at' => now(),
                'executed_at' => now(),
            ]);

            return $action;
        }

        $action->update(['confirmed_at' => now()]);

        try {
            $validated = $tool->validateArguments($action->arguments ?? [], $user);
            $result = $tool->invoke($validated, $user);
            $action->update([
                'status' => 'executed',
                'result' => $result,
                'error' => null,
                'executed_at' => now(),
            ]);

            try {
                $this->memoryService->recordFromAction($action->refresh(), $user);
            } catch (\Throwable $exception) {
                // Memory failures should not block action execution.
            }
        } catch (ValidationException $exception) {
            $action->update([
                'status' => 'failed',
                'error' => $this->formatValidationErrors($exception),
                'executed_at' => now(),
            ]);
        } catch (\Throwable $exception) {
            $action->update([
                'status' => 'failed',
                'error' => $exception->getMessage(),
                'executed_at' => now(),
            ]);
        }

        return $action->refresh();
    }

    public function cancel(AiAction $action): AiAction
    {
        if (!in_array($action->status, ['pending_confirmation', 'invalid'], true)) {
            throw ValidationException::withMessages([
                'status' => ['La accion no se puede cancelar.'],
            ]);
        }

        $action->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        return $action->refresh();
    }

    protected function recordToolCall(AiConversation $conversation, User $user, array $call): ?array
    {
        $toolName = Arr::get($call, 'function.name');

        if (!$toolName) {
            return null;
        }

        $argsPayload = Arr::get($call, 'function.arguments', '{}');
        $arguments = json_decode($argsPayload, true);

        if (!is_array($arguments)) {
            return $this->createAction($conversation, $user, $toolName, [], 'invalid', 'Argumentos invalidos.');
        }

        $tool = $this->registry->get($toolName);

        if (!$tool) {
            return $this->createAction($conversation, $user, $toolName, $arguments, 'invalid', 'Tool no registrado.');
        }

        try {
            $validated = $tool->validateArguments($arguments, $user);
        } catch (ValidationException $exception) {
            return $this->createAction(
                $conversation,
                $user,
                $toolName,
                $arguments,
                'invalid',
                $this->formatValidationErrors($exception)
            );
        }

        return $this->createAction(
            $conversation,
            $user,
            $toolName,
            $validated,
            'pending_confirmation',
            null
        );
    }

    protected function createAction(
        AiConversation $conversation,
        User $user,
        string $tool,
        array $arguments,
        string $status,
        ?string $error
    ): array {
        $action = AiAction::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'company_id' => $user->company_id,
            'tool' => $tool,
            'arguments' => $arguments,
            'status' => $status,
            'requires_confirmation' => $status === 'pending_confirmation',
            'error' => $error,
        ]);

        return $this->serialize($action);
    }

    protected function serialize(AiAction $action): array
    {
        return [
            'id' => $action->id,
            'tool' => $action->tool,
            'status' => $action->status,
            'requires_confirmation' => $action->requires_confirmation,
            'arguments' => $action->arguments,
            'error' => $action->error,
            'confirmed_at' => optional($action->confirmed_at)->toIso8601String(),
            'executed_at' => optional($action->executed_at)->toIso8601String(),
            'cancelled_at' => optional($action->cancelled_at)->toIso8601String(),
        ];
    }

    protected function formatValidationErrors(ValidationException $exception): string
    {
        $errors = $exception->errors();

        $messages = [];
        foreach ($errors as $field => $fieldMessages) {
            foreach ($fieldMessages as $message) {
                $messages[] = "{$field}: {$message}";
            }
        }

        return $messages !== [] ? implode(' ', $messages) : 'Validacion fallida.';
    }
}
