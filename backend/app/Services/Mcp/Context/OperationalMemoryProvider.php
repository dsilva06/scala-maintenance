<?php

namespace App\Services\Mcp\Context;

use App\Models\AiMemory;
use App\Models\User;
use App\Services\Mcp\Contracts\ContextProviderInterface;
use App\Support\CompanyScope;
use Illuminate\Support\Str;

class OperationalMemoryProvider implements ContextProviderInterface
{
    public function build(User $user, array $options = []): array
    {
        $message = $options['message'] ?? null;

        if (!is_string($message) || trim($message) === '') {
            return [];
        }

        $terms = $this->extractTerms($message);

        if ($terms === []) {
            return [];
        }

        $limit = (int) ($options['operational_memory_limit'] ?? 6);
        if ($limit <= 0) {
            return [];
        }

        $query = CompanyScope::apply(AiMemory::query(), $user)
            ->where('user_id', $user->id);
        $this->applySearch($query, $terms);

        $memories = $query->orderByDesc('importance')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get(['id', 'entity_type', 'entity_id', 'action', 'summary', 'data', 'importance', 'created_at']);

        if ($memories->isEmpty()) {
            return [];
        }

        return [
            'operational_memory' => [
                'terms' => $terms,
                'count' => $memories->count(),
                'matches' => $memories->map(fn ($memory) => [
                    'id' => $memory->id,
                    'entity_type' => $memory->entity_type,
                    'entity_id' => $memory->entity_id,
                    'action' => $memory->action,
                    'summary' => $memory->summary,
                    'importance' => $memory->importance,
                    'data' => $memory->data ?? [],
                    'created_at' => optional($memory->created_at)->toIso8601String(),
                ])->all(),
            ],
        ];
    }

    protected function extractTerms(string $message): array
    {
        $normalized = Str::lower($message);
        $normalized = preg_replace('/[^a-z0-9\\s_-]/', ' ', $normalized) ?? '';
        $parts = preg_split('/\\s+/', $normalized, -1, PREG_SPLIT_NO_EMPTY) ?: [];

        $stopwords = [
            'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'y',
            'o', 'a', 'en', 'por', 'para', 'con', 'sin', 'sobre', 'al', 'que', 'como',
            'si', 'no', 'es', 'son', 'ser', 'fue', 'fui', 'yo', 'tu', 'mi', 'mis',
            'su', 'sus', 'tuya', 'tuya', 'nuestro', 'nuestra', 'esto', 'esta', 'estos',
            'estas', 'donde', 'cuando', 'cual', 'cuales', 'porque', 'quiero', 'necesito',
            'hoy', 'ayer', 'manana', 'ahora', 'favor', 'porfa', 'hola', 'buenas',
            'gracias', 'todo', 'todos', 'todas', 'ayuda', 'ayudame', 'resumen',
        ];

        $terms = [];
        foreach ($parts as $part) {
            if (strlen($part) < 3) {
                continue;
            }
            if (in_array($part, $stopwords, true)) {
                continue;
            }
            $terms[] = $part;
        }

        $terms = array_values(array_unique($terms));

        return array_slice($terms, 0, 6);
    }

    protected function applySearch($query, array $terms): void
    {
        $query->where(function ($inner) use ($terms) {
            foreach ($terms as $term) {
                $like = '%' . $term . '%';
                $inner->orWhere('summary', 'like', $like)
                    ->orWhere('search_text', 'like', $like)
                    ->orWhere('entity_type', 'like', $like);
            }
        });
    }
}
