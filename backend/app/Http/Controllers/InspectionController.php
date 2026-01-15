<?php

namespace App\Http\Controllers;

use App\Actions\Inspections\CreateInspection;
use App\Actions\Inspections\DeleteInspection;
use App\Actions\Inspections\UpdateInspection;
use App\Http\Controllers\Concerns\AuthorizesCompanyResource;
use App\Http\Resources\InspectionResource;
use App\Models\Inspection;
use App\Queries\Inspections\InspectionIndexQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\InspectionStoreRequest;
use App\Http\Requests\InspectionUpdateRequest;

class InspectionController extends Controller
{
    use AuthorizesCompanyResource;

    public function index(Request $request, InspectionIndexQuery $inspectionIndexQuery)
    {
        $inspections = $inspectionIndexQuery
            ->handle($request, $request->user())
            ->get();

        return InspectionResource::collection($inspections);
    }

    public function store(InspectionStoreRequest $request, CreateInspection $createInspection)
    {
        $this->authorizeCompanyWrite($request);
        $inspection = $createInspection->handle($request->user(), $request->validated());

        return InspectionResource::make($inspection->load('vehicle'))->response()->setStatusCode(201);
    }

    public function show(Request $request, Inspection $inspection)
    {
        $this->authorizeCompanyRead($request, $inspection);

        return InspectionResource::make($inspection->load('vehicle'));
    }

    public function update(InspectionUpdateRequest $request, Inspection $inspection, UpdateInspection $updateInspection)
    {
        $this->authorizeCompanyRead($request, $inspection);
        $this->authorizeCompanyWrite($request);

        $inspection = $updateInspection->handle($request->user(), $inspection, $request->validated());

        return InspectionResource::make($inspection->load('vehicle'));
    }

    public function destroy(Request $request, Inspection $inspection, DeleteInspection $deleteInspection)
    {
        $this->authorizeCompanyRead($request, $inspection);
        $this->authorizeCompanyWrite($request);

        $deleteInspection->handle($request->user(), $inspection);

        return new JsonResponse(null, 204);
    }
}
