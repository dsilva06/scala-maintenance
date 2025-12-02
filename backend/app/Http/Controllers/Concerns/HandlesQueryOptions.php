<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

trait HandlesQueryOptions
{
    protected function applyQueryOptions(Request $request, Builder $query, array $sortable = ['created_at'], array $searchable = []): Builder
    {
        $sort = $request->query('sort');
        if ($sort) {
            $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
            $key = ltrim($sort, '-');

            $column = $this->mapSortKey($key, $sortable);
            if ($column) {
                $query->orderBy($column, $direction);
            }
        } else {
            $query->latest();
        }

        if ($search = $request->query('search')) {
            $query->where(function (Builder $inner) use ($search, $searchable) {
                foreach ($searchable as $index => $column) {
                    $method = $index === 0 ? 'where' : 'orWhere';
                    $inner->{$method}($column, 'like', "%{$search}%");
                }
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($limit = (int) $request->query('limit')) {
            $query->limit($limit);
        }

        return $query;
    }

    protected function mapSortKey(string $key, array $sortable): ?string
    {
        $map = [
            'created_date' => 'created_at',
            'updated_date' => 'updated_at',
        ];

        $column = $map[$key] ?? $key;

        return in_array($column, $sortable, true) ? $column : null;
    }
}
