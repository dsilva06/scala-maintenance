<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Models\Inspection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
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
}
