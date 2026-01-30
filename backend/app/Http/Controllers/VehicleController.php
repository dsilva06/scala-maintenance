<?php

namespace App\Http\Controllers;

use App\Actions\Vehicles\CreateVehicle;
use App\Actions\Vehicles\DeleteVehicle;
use App\Actions\Vehicles\UpdateVehicle;
use App\Http\Controllers\Concerns\AuthorizesCompanyResource;
use App\Http\Resources\VehicleResource;
use App\Models\Vehicle;
use App\Queries\Vehicles\VehicleIndexQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\VehicleStoreRequest;
use App\Http\Requests\VehicleUpdateRequest;

class VehicleController extends Controller
{
    use AuthorizesCompanyResource;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, VehicleIndexQuery $vehicleIndexQuery)
    {
        $vehicles = $vehicleIndexQuery
            ->handle($request, $request->user())
            ->get();

        return VehicleResource::collection($vehicles);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(VehicleStoreRequest $request, CreateVehicle $createVehicle)
    {
        $this->authorizeCompanyWrite($request);

        $validated = $request->validated();

        $vehicle = $createVehicle->handle($request->user(), $validated);

        return VehicleResource::make($vehicle->load('tirePositions'))->response()->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Vehicle $vehicle)
    {
        $this->authorizeCompanyRead($request, $vehicle);

        $vehicle->load([
            'tirePositions',
            'activeTireAssignments.tire.type',
        ]);

        return VehicleResource::make($vehicle);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(VehicleUpdateRequest $request, Vehicle $vehicle, UpdateVehicle $updateVehicle)
    {
        $this->authorizeCompanyRead($request, $vehicle);
        $this->authorizeCompanyWrite($request);

        $validated = $request->validated();

        $vehicle = $updateVehicle->handle($request->user(), $vehicle, $validated);

        return VehicleResource::make($vehicle->load('tirePositions'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Vehicle $vehicle, DeleteVehicle $deleteVehicle)
    {
        $this->authorizeCompanyRead($request, $vehicle);
        $this->authorizeCompanyWrite($request);

        $deleteVehicle->handle($request->user(), $vehicle);

        return new JsonResponse(null, 204);
    }
}
