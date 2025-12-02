<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Models\Trip;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Requests\TripStoreRequest;
use App\Http\Requests\TripUpdateRequest;

class TripController extends Controller
{
    use HandlesQueryOptions;

    public function index(Request $request)
    {
        $query = Trip::query()
            ->with('vehicle')
            ->where('user_id', $request->user()->id);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $this->applyQueryOptions($request, $query, [
            'start_date', 'created_at', 'status',
        ], [
            'origin', 'destination', 'driver_name',
        ]);

        return JsonResource::collection($query->get());
    }

    public function store(TripStoreRequest $request)
    {
        $user = $request->user();

        $validated = $request->validated();

        $trip = $user->trips()->create($validated);

        return JsonResource::make($trip->load('vehicle'))->response()->setStatusCode(201);
    }

    public function show(Request $request, Trip $trip)
    {
        $this->authorizeResource($request, $trip);

        return JsonResource::make($trip->load('vehicle'));
    }

    public function update(TripUpdateRequest $request, Trip $trip)
    {
        $this->authorizeResource($request, $trip);

        $validated = $request->validated();

        $trip->update($validated);

        return JsonResource::make($trip->load('vehicle'));
    }

    public function destroy(Request $request, Trip $trip)
    {
        $this->authorizeResource($request, $trip);

        $trip->delete();

        return new JsonResponse(null, 204);
    }

    protected function authorizeResource(Request $request, Trip $trip): void
    {
        if ($trip->user_id !== $request->user()->id) {
            abort(403, 'No autorizado.');
        }
    }
}
