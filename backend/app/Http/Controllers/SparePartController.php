<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Models\SparePart;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;
use App\Http\Requests\SparePartStoreRequest;
use App\Http\Requests\SparePartUpdateRequest;

class SparePartController extends Controller
{
    use HandlesQueryOptions;

    public function index(Request $request)
    {
        $query = SparePart::query()
            ->where('user_id', $request->user()->id);

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        $this->applyQueryOptions($request, $query, [
            'created_at', 'updated_at', 'name', 'sku', 'current_stock',
        ], [
            'name', 'sku', 'part_number', 'brand', 'category',
        ]);

        return JsonResource::collection($query->get());
    }

    public function store(SparePartStoreRequest $request)
    {
        $user = $request->user();

        $validated = $request->validated();

        $part = $user->spareParts()->create($this->normalize($validated));

        return JsonResource::make($part)->response()->setStatusCode(201);
    }

    public function show(Request $request, SparePart $sparePart)
    {
        $this->authorizeResource($request, $sparePart);

        return JsonResource::make($sparePart);
    }

    public function update(SparePartUpdateRequest $request, SparePart $sparePart)
    {
        $this->authorizeResource($request, $sparePart);

        $validated = $request->validated();

        $sparePart->update($this->normalize($validated));

        return JsonResource::make($sparePart);
    }

    public function destroy(Request $request, SparePart $sparePart)
    {
        $this->authorizeResource($request, $sparePart);

        $sparePart->delete();

        return new JsonResponse(null, 204);
    }

    protected function authorizeResource(Request $request, SparePart $part): void
    {
        if ($part->user_id !== $request->user()->id) {
            abort(403, 'No autorizado.');
        }
    }

    protected function normalize(array $attributes): array
    {
        if (array_key_exists('sku', $attributes)) {
            $attributes['sku'] = Str::upper(trim($attributes['sku']));
        }

        if (array_key_exists('part_number', $attributes) && $attributes['part_number'] !== null) {
            $attributes['part_number'] = Str::upper(trim($attributes['part_number']));
        }

        foreach (['name', 'brand', 'category', 'supplier', 'storage_location', 'status'] as $key) {
            if (array_key_exists($key, $attributes) && is_string($attributes[$key])) {
                $attributes[$key] = trim($attributes[$key]);
            }
        }

        return $attributes;
    }
}
