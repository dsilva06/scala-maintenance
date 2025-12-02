<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Models\MaintenanceOrder;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use App\Http\Requests\MaintenanceOrderStoreRequest;
use App\Http\Requests\MaintenanceOrderUpdateRequest;

class MaintenanceOrderController extends Controller
{
    use HandlesQueryOptions;

    public function index(Request $request)
    {
        $query = MaintenanceOrder::query()
            ->with('vehicle')
            ->where('user_id', $request->user()->id);

        if ($vehicleId = $request->query('vehicle_id')) {
            $query->where('vehicle_id', $vehicleId);
        }

        $this->applyQueryOptions($request, $query, [
            'created_at', 'updated_at', 'scheduled_date', 'priority', 'status',
        ], [
            'order_number', 'title', 'description', 'mechanic',
        ]);

        return JsonResource::collection($query->get());
    }

    public function store(MaintenanceOrderStoreRequest $request)
    {
        $user = $request->user();

        $validated = $request->validated();

        $this->ensureVehicleBelongsToUser(Arr::get($validated, 'vehicle_id'), $user->id);

        $order = $user->maintenanceOrders()->create($this->normalizePayload($validated));

        return JsonResource::make($order->load('vehicle'))->response()->setStatusCode(201);
    }

    public function show(Request $request, MaintenanceOrder $maintenanceOrder)
    {
        $this->authorizeOrder($request, $maintenanceOrder);

        return JsonResource::make($maintenanceOrder->load('vehicle'));
    }

    public function update(MaintenanceOrderUpdateRequest $request, MaintenanceOrder $maintenanceOrder)
    {
        $this->authorizeOrder($request, $maintenanceOrder);

        $validated = $request->validated();

        if (array_key_exists('vehicle_id', $validated)) {
            $this->ensureVehicleBelongsToUser($validated['vehicle_id'], $request->user()->id);
        }

        $maintenanceOrder->update($this->normalizePayload($validated));

        return JsonResource::make($maintenanceOrder->load('vehicle'));
    }

    public function destroy(Request $request, MaintenanceOrder $maintenanceOrder)
    {
        $this->authorizeOrder($request, $maintenanceOrder);

        $maintenanceOrder->delete();

        return new JsonResponse(null, 204);
    }

    protected function authorizeOrder(Request $request, MaintenanceOrder $order): void
    {
        if ($order->user_id !== $request->user()->id) {
            abort(403, 'No autorizado.');
        }
    }

    protected function ensureVehicleBelongsToUser(?int $vehicleId, int $userId): void
    {
        if ($vehicleId === null) {
            return;
        }

        $ownsVehicle = Vehicle::whereKey($vehicleId)
            ->where('user_id', $userId)
            ->exists();

        if (! $ownsVehicle) {
            abort(422, 'El vehículo seleccionado no pertenece al usuario autenticado.');
        }
    }

    protected function normalizePayload(array $attributes): array
    {
        if (array_key_exists('order_number', $attributes)) {
            $attributes['order_number'] = Str::upper(trim($attributes['order_number']));
        }

        foreach (['type', 'status', 'priority', 'title', 'description', 'mechanic'] as $key) {
            if (array_key_exists($key, $attributes) && is_string($attributes[$key])) {
                $attributes[$key] = trim($attributes[$key]);
            }
        }

        return $attributes;
    }
}
