<?php

namespace App\Services\Mcp\Context;

use App\Models\AiConversation;
use App\Models\User;
use App\Services\Mcp\Contracts\ContextProviderInterface;

class ConversationMemoryProvider implements ContextProviderInterface
{
    public function build(User $user, array $options = []): array
    {
        $conversation = $options['conversation'] ?? null;

        if (!$conversation instanceof AiConversation) {
            return [];
        }

        $limit = (int) ($options['memory_limit'] ?? 8);

        $messages = $conversation->messages()
            ->latest()
            ->take($limit)
            ->get()
            ->sortBy('created_at')
            ->values();

        return [
            'memory' => [
                'recent_messages' => $messages->map(fn ($message) => [
                    'role' => $message->role,
                    'content' => $message->content,
                    'created_at' => optional($message->created_at)->toIso8601String(),
                ])->all(),
                'message_count' => $messages->count(),
            ],
        ];
    }
}
