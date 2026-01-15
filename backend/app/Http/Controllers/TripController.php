<?php

namespace App\Http\Controllers;

use App\Actions\Trips\CreateTrip;
use App\Actions\Trips\DeleteTrip;
use App\Actions\Trips\UpdateTrip;
use App\Http\Controllers\Concerns\AuthorizesCompanyResource;
use App\Http\Resources\TripResource;
use App\Models\Trip;
use App\Queries\Trips\TripIndexQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\TripStoreRequest;
use App\Http\Requests\TripUpdateRequest;

class TripController extends Controller
{
    use AuthorizesCompanyResource;

    public function index(Request $request, TripIndexQuery $tripIndexQuery)
    {
        $trips = $tripIndexQuery
            ->handle($request, $request->user())
            ->get();

        return TripResource::collection($trips);
    }

    public function store(TripStoreRequest $request, CreateTrip $createTrip)
    {
        $this->authorizeCompanyWrite($request);
        $user = $request->user();

        $validated = $request->validated();

        $trip = $createTrip->handle($user, $validated);

        return TripResource::make($trip->load('vehicle'))->response()->setStatusCode(201);
    }

    public function show(Request $request, Trip $trip)
    {
        $this->authorizeCompanyRead($request, $trip);

        $historyLimit = (int) config('fleet.telemetry.position_history_limit', 50);

        return TripResource::make($trip->load([
            'vehicle',
            'latestPosition',
            'positions' => fn ($query) => $query
                ->orderByDesc('recorded_at')
                ->limit($historyLimit),
        ]));
    }

    public function update(TripUpdateRequest $request, Trip $trip, UpdateTrip $updateTrip)
    {
        $this->authorizeCompanyRead($request, $trip);
        $this->authorizeCompanyWrite($request);

        $validated = $request->validated();

        $trip = $updateTrip->handle($request->user(), $trip, $validated);

        return TripResource::make($trip->load('vehicle'));
    }

    public function destroy(Request $request, Trip $trip, DeleteTrip $deleteTrip)
    {
        $this->authorizeCompanyRead($request, $trip);
        $this->authorizeCompanyWrite($request);

        $deleteTrip->handle($request->user(), $trip);

        return new JsonResponse(null, 204);
    }
}
