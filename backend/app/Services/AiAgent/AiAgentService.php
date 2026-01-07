<?php

namespace App\Services\AiAgent;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;

class AiAgentService
{
    public function __construct(
        protected readonly array $config = []
    ) {
    }

    public function generateDraftResponse(string $message, array $context = []): array
    {
        $config = array_merge(config('services.ai_agent', []), $this->config);
        $apiKey = $config['api_key'] ?? null;
        $provider = $config['provider'] ?? 'openai';

        if (empty($apiKey)) {
            return [
                'content' => "AI draft (no provider wired): {$message}",
                'metadata' => [
                    'provider' => 'unset',
                    'status' => 'stub_missing_api_key',
                    'context_keys' => array_keys($context),
                ],
            ];
        }

        $baseUrl = rtrim($config['base_url'] ?? 'https://api.openai.com/v1', '/');
        $model = $config['model'] ?? 'gpt-4.1-mini';
        $timeout = (int) ($config['timeout'] ?? 15);

        $payload = [
            'model' => $model,
            'messages' => $this->buildMessages($message, $context),
        ];

        if (!empty($context['tools']) && is_array($context['tools'])) {
            $payload['tools'] = $context['tools'];
            $payload['tool_choice'] = 'auto';
        }

        $response = Http::withToken($apiKey)
            ->baseUrl($baseUrl)
            ->acceptJson()
            ->timeout($timeout)
            ->post('/chat/completions', $payload);

        if ($response->failed()) {
            abort(502, 'No se pudo obtener respuesta del proveedor AI.');
        }

        $body = $response->json();
        $messagePayload = Arr::get($body, 'choices.0.message', []);
        $content = Arr::get($messagePayload, 'content');
        $toolCalls = Arr::get($messagePayload, 'tool_calls', []);

        if ((!is_string($content) || trim($content) === '') && empty($toolCalls)) {
            abort(502, 'Respuesta inválida del proveedor AI.');
        }

        if (!is_string($content)) {
            $content = '';
        }

        $usage = Arr::get($body, 'usage', []);

        return [
            'content' => $content,
            'metadata' => [
                'provider' => $provider,
                'model' => $model,
                'status' => 'completed',
                'prompt_tokens' => Arr::get($usage, 'prompt_tokens'),
                'completion_tokens' => Arr::get($usage, 'completion_tokens'),
                'total_tokens' => Arr::get($usage, 'total_tokens'),
                'context_keys' => array_keys($context),
                'tool_calls' => $toolCalls,
            ],
        ];
    }

    protected function buildMessages(string $message, array $context = []): array
    {
        $messages = [];

        $messages[] = [
            'role' => 'system',
            'content' => implode("\n", [
                'Eres un asistente experto en mantenimiento de flotas.',
                'Responde con claridad y en pasos accionables.',
                'Nunca inventes datos. Si faltan datos, pide lo necesario.',
                'Si el usuario pide ejecutar una tarea y tienes datos completos, usa una herramienta.',
                'Todas las acciones requieren confirmacion humana antes de ejecutarse.',
                'Si faltan datos para una herramienta, pide la informacion faltante.',
            ]),
        ];

        if (!empty($context['summary'])) {
            $messages[] = [
                'role' => 'system',
                'content' => "Contexto del negocio: {$context['summary']}",
            ];
        }

        if (!empty($context['policies']['summary'])) {
            $messages[] = [
                'role' => 'system',
                'content' => "Politicas y umbrales:\n{$context['policies']['summary']}",
            ];
        }

        if (!empty($context['stats'])) {
            $messages[] = [
                'role' => 'system',
                'content' => 'Datos estructurados (JSON): ' . json_encode($context['stats']),
            ];
        }

        if (!empty($context['memory']['recent_messages'])) {
            $recent = array_slice($context['memory']['recent_messages'], -8);
            $lines = [];
            foreach ($recent as $item) {
                if (!empty($item['role']) && isset($item['content'])) {
                    $lines[] = "{$item['role']}: {$item['content']}";
                }
            }

            if ($lines !== []) {
                $messages[] = [
                    'role' => 'system',
                    'content' => "Conversacion reciente:\n" . implode("\n", $lines),
                ];
            }
        }

        if (!empty($context['search'])) {
            $messages[] = [
                'role' => 'system',
                'content' => 'Resultados de busqueda (JSON): ' . json_encode($context['search']),
            ];
        }

        if (!empty($context['instructions'])) {
            $messages[] = [
                'role' => 'system',
                'content' => $context['instructions'],
            ];
        }

        $messages[] = [
            'role' => 'user',
            'content' => $message,
        ];

        return $messages;
    }
}
