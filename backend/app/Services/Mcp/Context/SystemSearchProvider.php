<?php

namespace App\Services\Mcp\Context;

use App\Models\AiMessage;
use App\Models\Alert;
use App\Models\Document;
use App\Models\Inspection;
use App\Models\MaintenanceOrder;
use App\Models\PurchaseOrder;
use App\Models\SparePart;
use App\Models\Trip;
use App\Models\User;
use App\Models\Vehicle;
use App\Services\Mcp\Contracts\ContextProviderInterface;
use Illuminate\Support\Str;

class SystemSearchProvider implements ContextProviderInterface
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

        $results = [
            'vehicles' => $this->searchVehicles($user, $terms),
            'maintenance_orders' => $this->searchMaintenanceOrders($user, $terms),
            'spare_parts' => $this->searchSpareParts($user, $terms),
            'purchase_orders' => $this->searchPurchaseOrders($user, $terms),
            'documents' => $this->searchDocuments($user, $terms),
            'alerts' => $this->searchAlerts($user, $terms),
            'inspections' => $this->searchInspections($user, $terms),
            'trips' => $this->searchTrips($user, $terms),
            'past_messages' => $this->searchMessages($user, $terms),
        ];

        $filtered = array_filter($results, fn ($items) => !empty($items));

        if ($filtered === []) {
            return [];
        }

        return [
            'search' => [
                'terms' => $terms,
                'results' => $filtered,
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

        return array_slice($terms, 0, 5);
    }

    protected function searchVehicles(User $user, array $terms): array
    {
        $query = Vehicle::query()->where('user_id', $user->id);

        $this->applySearch($query, $terms, ['plate', 'brand', 'model', 'vin', 'assigned_driver']);

        return $query->limit(3)->get(['id', 'plate', 'brand', 'model', 'status'])->toArray();
    }

    protected function searchMaintenanceOrders(User $user, array $terms): array
    {
        $query = MaintenanceOrder::query()->where('user_id', $user->id);

        $this->applySearch($query, $terms, ['order_number', 'title', 'description', 'mechanic']);

        return $query->limit(3)->get(['id', 'order_number', 'status', 'priority', 'title'])->toArray();
    }

    protected function searchSpareParts(User $user, array $terms): array
    {
        $query = SparePart::query()->where('user_id', $user->id);

        $this->applySearch($query, $terms, ['sku', 'part_number', 'name', 'brand', 'category']);

        return $query->limit(3)->get(['id', 'sku', 'name', 'current_stock', 'minimum_stock'])->toArray();
    }

    protected function searchPurchaseOrders(User $user, array $terms): array
    {
        $query = PurchaseOrder::query()->where('user_id', $user->id);

        $this->applySearch($query, $terms, ['order_number', 'supplier', 'product_name', 'notes']);

        return $query->limit(3)->get(['id', 'order_number', 'supplier', 'status', 'priority'])->toArray();
    }

    protected function searchDocuments(User $user, array $terms): array
    {
        $query = Document::query()->where('user_id', $user->id);

        $this->applySearch($query, $terms, ['document_type', 'document_number', 'issuing_entity', 'notes']);

        return $query->limit(3)->get(['id', 'document_type', 'document_number', 'status', 'expiration_date'])->toArray();
    }

    protected function searchAlerts(User $user, array $terms): array
    {
        $query = Alert::query()->where('user_id', $user->id);

        $this->applySearch($query, $terms, ['title', 'description', 'type']);

        return $query->limit(3)->get(['id', 'title', 'severity', 'status'])->toArray();
    }

    protected function searchInspections(User $user, array $terms): array
    {
        $query = Inspection::query()->where('user_id', $user->id);

        $this->applySearch($query, $terms, ['inspector', 'notes', 'overall_status']);

        return $query->limit(3)->get(['id', 'inspection_date', 'overall_status', 'vehicle_id'])->toArray();
    }

    protected function searchTrips(User $user, array $terms): array
    {
        $query = Trip::query()->where('user_id', $user->id);

        $this->applySearch($query, $terms, ['origin', 'destination', 'driver_name', 'cargo_description', 'status']);

        return $query->limit(3)->get(['id', 'origin', 'destination', 'status', 'start_date'])->toArray();
    }

    protected function searchMessages(User $user, array $terms): array
    {
        $query = AiMessage::query()->where('user_id', $user->id);

        $this->applySearch($query, $terms, ['content']);

        $messages = $query->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'conversation_id', 'role', 'content', 'created_at']);

        return $messages->map(fn ($message) => [
            'conversation_id' => $message->conversation_id,
            'role' => $message->role,
            'content' => $this->truncate($message->content, 200),
            'created_at' => optional($message->created_at)->toIso8601String(),
        ])->all();
    }

    protected function applySearch($query, array $terms, array $fields): void
    {
        $query->where(function ($inner) use ($terms, $fields) {
            foreach ($terms as $term) {
                $like = '%' . $term . '%';
                foreach ($fields as $field) {
                    $inner->orWhere($field, 'like', $like);
                }
            }
        });
    }

    protected function truncate(string $value, int $limit): string
    {
        if (strlen($value) <= $limit) {
            return $value;
        }

        return substr($value, 0, $limit) . '...';
    }
}
