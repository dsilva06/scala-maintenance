<?php

namespace App\Http\Controllers;

use App\Actions\RepairGuides\CreateRepairGuide;
use App\Actions\RepairGuides\DeleteRepairGuide;
use App\Actions\RepairGuides\UpdateRepairGuide;
use App\Http\Controllers\Concerns\AuthorizesCompanyResource;
use App\Http\Resources\RepairGuideResource;
use App\Models\RepairGuide;
use App\Queries\RepairGuides\RepairGuideIndexQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\RepairGuideStoreRequest;
use App\Http\Requests\RepairGuideUpdateRequest;

class RepairGuideController extends Controller
{
    use AuthorizesCompanyResource;

    public function index(Request $request, RepairGuideIndexQuery $repairGuideIndexQuery)
    {
        $guides = $repairGuideIndexQuery
            ->handle($request, $request->user())
            ->get();

        return RepairGuideResource::collection($guides);
    }

    public function store(RepairGuideStoreRequest $request, CreateRepairGuide $createRepairGuide)
    {
        $this->authorizeCompanyWrite($request);
        $guide = $createRepairGuide->handle($request->user(), $request->validated());

        return RepairGuideResource::make($guide)->response()->setStatusCode(201);
    }

    public function show(Request $request, RepairGuide $repairGuide)
    {
        $this->authorizeCompanyRead($request, $repairGuide);

        return RepairGuideResource::make($repairGuide);
    }

    public function update(RepairGuideUpdateRequest $request, RepairGuide $repairGuide, UpdateRepairGuide $updateRepairGuide)
    {
        $this->authorizeCompanyRead($request, $repairGuide);
        $this->authorizeCompanyWrite($request);

        $repairGuide = $updateRepairGuide->handle($request->user(), $repairGuide, $request->validated());

        return RepairGuideResource::make($repairGuide);
    }

    public function destroy(Request $request, RepairGuide $repairGuide, DeleteRepairGuide $deleteRepairGuide)
    {
        $this->authorizeCompanyRead($request, $repairGuide);
        $this->authorizeCompanyWrite($request);

        $deleteRepairGuide->handle($request->user(), $repairGuide);

        return new JsonResponse(null, 204);
    }
}
