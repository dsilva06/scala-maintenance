<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;
use App\Http\Requests\VehicleStoreRequest;
use App\Http\Requests\VehicleUpdateRequest;

class VehicleController extends Controller
{
    use HandlesQueryOptions;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Vehicle::query()->where('user_id', $request->user()->id);

        $this->applyQueryOptions($request, $query, [
            'created_at',
            'updated_at',
            'plate',
            'brand',
        ], [
            'plate', 'brand', 'model', 'vin',
        ]);

        return JsonResource::collection($query->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(VehicleStoreRequest $request)
    {
        $validated = $request->validated();

        $vehicle = $request->user()->vehicles()->create($this->normalizePayload($validated));

        return JsonResource::make($vehicle)->response()->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Vehicle $vehicle)
    {
        $this->authorizeVehicle($request, $vehicle);

        return JsonResource::make($vehicle);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(VehicleUpdateRequest $request, Vehicle $vehicle)
    {
        $this->authorizeVehicle($request, $vehicle);

        $validated = $request->validated();

        $vehicle->update($this->normalizePayload($validated));

        return JsonResource::make($vehicle);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Vehicle $vehicle)
    {
        $this->authorizeVehicle($request, $vehicle);

        $vehicle->delete();

        return new JsonResponse(null, 204);
    }

    protected function authorizeVehicle(Request $request, Vehicle $vehicle): void
    {
        if ($vehicle->user_id !== $request->user()->id) {
            abort(403, 'No autorizado.');
        }
    }

    protected function normalizePayload(array $attributes): array
    {
        if (array_key_exists('plate', $attributes)) {
            $attributes['plate'] = Str::upper(trim($attributes['plate']));
        }

        foreach (['brand', 'model', 'color', 'vin', 'vehicle_type', 'status', 'fuel_type', 'assigned_driver'] as $key) {
            if (array_key_exists($key, $attributes) && is_string($attributes[$key])) {
                $attributes[$key] = trim($attributes[$key]);
            }
        }

        return $attributes;
    }
}
