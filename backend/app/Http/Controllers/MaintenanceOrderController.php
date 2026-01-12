<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Models\Inspection;
use App\Models\MaintenanceOrder;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
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

        if ($month = $request->query('month')) {
            try {
                $start = Carbon::parse($month . '-01')->startOfMonth();
                $end = (clone $start)->endOfMonth();
                $query->whereBetween('created_at', [$start, $end]);
            } catch (\Exception $e) {
                // ignore invalid month format
            }
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

        if ($order->vehicle_id) {
            $this->refreshVehicleStatus($order->vehicle_id, $user->id);
            $this->syncVehicleMileageFromOrder($order, $validated);
        }
        $this->refreshInspectionStatus($order);

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

        if ($maintenanceOrder->vehicle_id) {
            $this->refreshVehicleStatus($maintenanceOrder->vehicle_id, $request->user()->id);
            $this->syncVehicleMileageFromOrder($maintenanceOrder, $validated);
        }
        $this->refreshInspectionStatus($maintenanceOrder);

        return JsonResource::make($maintenanceOrder->load('vehicle'));
    }

    public function destroy(Request $request, MaintenanceOrder $maintenanceOrder)
    {
        $this->authorizeOrder($request, $maintenanceOrder);

        $maintenanceOrder->delete();

        if ($maintenanceOrder->vehicle_id) {
            $this->refreshVehicleStatus($maintenanceOrder->vehicle_id, $request->user()->id);
        }
        $this->refreshInspectionStatus($maintenanceOrder);

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

    protected function refreshVehicleStatus(int $vehicleId, int $userId): void
    {
        $openStatuses = ['pendiente', 'en_progreso'];

        $hasOpenOrders = MaintenanceOrder::where('vehicle_id', $vehicleId)
            ->where('user_id', $userId)
            ->whereIn('status', $openStatuses)
            ->exists();

        $newStatus = $hasOpenOrders ? 'mantenimiento' : 'activo';

        Vehicle::where('id', $vehicleId)
            ->where('user_id', $userId)
            ->update(['status' => $newStatus]);
    }

    protected function syncVehicleMileageFromOrder(MaintenanceOrder $order, array $attributes): void
    {
        if ($order->status !== 'completada') {
            return;
        }

        $completionMileage = $attributes['completion_mileage'] ?? null;

        if ($completionMileage === null) {
            return;
        }

        $vehicle = Vehicle::where('id', $order->vehicle_id)
            ->where('user_id', $order->user_id)
            ->first();

        if (! $vehicle) {
            return;
        }

        $currentMileage = (int) ($vehicle->current_mileage ?? 0);
        $newMileage = max($currentMileage, (int) $completionMileage);

        $updates = ['current_mileage' => $newMileage];

        if ($order->completion_date) {
            $updates['last_service_date'] = $order->completion_date->toDateString();
        }

        $vehicle->update($updates);
    }

    protected function refreshInspectionStatus(MaintenanceOrder $order): void
    {
        $inspectionId = data_get($order->metadata, 'inspection_id');

        if (!$inspectionId) {
            return;
        }

        $inspection = Inspection::where('id', $inspectionId)
            ->where('user_id', $order->user_id)
            ->first();

        if (!$inspection) {
            return;
        }

        $baseQuery = MaintenanceOrder::where('user_id', $order->user_id)
            ->where('metadata->inspection_id', $inspectionId);

        if ((clone $baseQuery)->count() === 0) {
            return;
        }

        $hasIncomplete = (clone $baseQuery)
            ->where('status', '!=', 'completada')
            ->exists();

        $nextStatus = $hasIncomplete ? 'mantenimiento' : 'ok';

        if ($inspection->overall_status !== $nextStatus) {
            $inspection->update(['overall_status' => $nextStatus]);
        }
    }
}
