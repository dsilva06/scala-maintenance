<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Models\Inspection;
use App\Models\MaintenanceOrder;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;
use App\Http\Requests\InspectionStoreRequest;
use App\Http\Requests\InspectionUpdateRequest;

class InspectionController extends Controller
{
    use HandlesQueryOptions;

    public function index(Request $request)
    {
        $query = Inspection::query()
            ->with('vehicle')
            ->where('user_id', $request->user()->id);

        if ($vehicleId = $request->query('vehicle_id')) {
            $query->where('vehicle_id', $vehicleId);
        }

        if ($month = $request->query('month')) {
            try {
                $start = Carbon::parse($month . '-01')->startOfMonth();
                $end = (clone $start)->endOfMonth();
                $query->whereBetween('inspection_date', [$start, $end]);
            } catch (\Exception $e) {
                // ignore invalid month format
            }
        }

        $this->applyQueryOptions($request, $query, [
            'inspection_date', 'created_at', 'overall_status',
        ], [
            'inspector', 'overall_status',
        ]);

        return JsonResource::collection($query->get());
    }

    public function store(InspectionStoreRequest $request)
    {
        $user = $request->user();

        $validated = $request->validated();

        $inspection = $user->inspections()->create($validated);

        $this->handlePostInspectionActions($inspection);

        return JsonResource::make($inspection->load('vehicle'))->response()->setStatusCode(201);
    }

    public function show(Request $request, Inspection $inspection)
    {
        $this->authorizeResource($request, $inspection);

        return JsonResource::make($inspection->load('vehicle'));
    }

    public function update(InspectionUpdateRequest $request, Inspection $inspection)
    {
        $this->authorizeResource($request, $inspection);

        $validated = $request->validated();

        $inspection->update($validated);

        $this->handlePostInspectionActions($inspection);

        return JsonResource::make($inspection->load('vehicle'));
    }

    public function destroy(Request $request, Inspection $inspection)
    {
        $this->authorizeResource($request, $inspection);

        $inspection->delete();

        return new JsonResponse(null, 204);
    }

    protected function authorizeResource(Request $request, Inspection $inspection): void
    {
        if ($inspection->user_id !== $request->user()->id) {
            abort(403, 'No autorizado.');
        }
    }

    protected function handlePostInspectionActions(Inspection $inspection): void
    {
        // Update vehicle status based on inspection result
        if ($inspection->vehicle_id) {
            $status = match ($inspection->overall_status) {
                'mantenimiento' => 'fuera_servicio',
                'revision' => 'mantenimiento',
                default => null,
            };

            if ($status) {
                Vehicle::where('id', $inspection->vehicle_id)
                    ->where('user_id', $inspection->user_id)
                    ->update(['status' => $status]);
            }
        }

        // If inspection flagged issues, create a maintenance order so it follows the process
        if (in_array($inspection->overall_status, ['mantenimiento', 'revision'], true)) {
            $type = $inspection->overall_status === 'mantenimiento' ? 'correctivo' : 'preventivo';
            $priority = $inspection->overall_status === 'mantenimiento' ? 'critica' : 'media';

            MaintenanceOrder::create([
                'user_id' => $inspection->user_id,
                'vehicle_id' => $inspection->vehicle_id,
                'order_number' => 'MNT-INS-' . now()->format('YmdHis'),
                'type' => $type,
                'priority' => $priority,
                'status' => 'pendiente',
                'description' => "Generado por inspección ({$inspection->overall_status})",
                'mechanic' => $inspection->inspector,
                'notes' => 'Orden creada automáticamente desde inspección.',
            ]);
        }
    }
}
