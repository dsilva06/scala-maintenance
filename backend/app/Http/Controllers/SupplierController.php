<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Http\Requests\SupplierStoreRequest;
use App\Http\Requests\SupplierUpdateRequest;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupplierController extends Controller
{
    use HandlesQueryOptions;

    public function index(Request $request)
    {
        $query = Supplier::query()->where('user_id', $request->user()->id);

        $this->applyQueryOptions($request, $query, ['created_at', 'updated_at', 'name'], ['name', 'contact_name', 'email', 'phone']);

        return JsonResource::collection($query->get());
    }

    public function store(SupplierStoreRequest $request)
    {
        $supplier = $request->user()->suppliers()->create($this->normalize($request->validated()));

        return JsonResource::make($supplier)->response()->setStatusCode(201);
    }

    public function show(Request $request, Supplier $supplier)
    {
        $this->authorizeResource($request, $supplier);

        return JsonResource::make($supplier);
    }

    public function update(SupplierUpdateRequest $request, Supplier $supplier)
    {
        $this->authorizeResource($request, $supplier);

        $supplier->update($this->normalize($request->validated()));

        return JsonResource::make($supplier);
    }

    public function destroy(Request $request, Supplier $supplier)
    {
        $this->authorizeResource($request, $supplier);

        $supplier->delete();

        return new JsonResponse(null, 204);
    }

    protected function authorizeResource(Request $request, Supplier $supplier): void
    {
        if ($supplier->user_id !== $request->user()->id) {
            abort(403, 'No autorizado.');
        }
    }

    protected function normalize(array $attributes): array
    {
        foreach (['name', 'contact_name', 'phone', 'email', 'notes'] as $key) {
            if (array_key_exists($key, $attributes) && is_string($attributes[$key])) {
                $value = trim($attributes[$key]);
                $attributes[$key] = $value === '' ? null : $value;
            }
        }

        return $attributes;
    }
}
