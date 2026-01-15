<?php

namespace App\Http\Controllers;

use App\Actions\SpareParts\CreateSparePart;
use App\Actions\SpareParts\DeleteSparePart;
use App\Actions\SpareParts\UpdateSparePart;
use App\Http\Controllers\Concerns\AuthorizesCompanyResource;
use App\Http\Resources\SparePartResource;
use App\Models\SparePart;
use App\Queries\SpareParts\SparePartIndexQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\SparePartStoreRequest;
use App\Http\Requests\SparePartUpdateRequest;

class SparePartController extends Controller
{
    use AuthorizesCompanyResource;

    public function index(Request $request, SparePartIndexQuery $sparePartIndexQuery)
    {
        $parts = $sparePartIndexQuery
            ->handle($request, $request->user())
            ->get();

        return SparePartResource::collection($parts);
    }

    public function store(SparePartStoreRequest $request, CreateSparePart $createSparePart)
    {
        $this->authorizeCompanyWrite($request);
        $part = $createSparePart->handle($request->user(), $request->validated());

        return SparePartResource::make($part)->response()->setStatusCode(201);
    }

    public function show(Request $request, SparePart $sparePart)
    {
        $this->authorizeCompanyRead($request, $sparePart);

        return SparePartResource::make($sparePart);
    }

    public function update(SparePartUpdateRequest $request, SparePart $sparePart, UpdateSparePart $updateSparePart)
    {
        $this->authorizeCompanyRead($request, $sparePart);
        $this->authorizeCompanyWrite($request);

        $sparePart = $updateSparePart->handle($request->user(), $sparePart, $request->validated());

        return SparePartResource::make($sparePart);
    }

    public function destroy(Request $request, SparePart $sparePart, DeleteSparePart $deleteSparePart)
    {
        $this->authorizeCompanyRead($request, $sparePart);
        $this->authorizeCompanyWrite($request);

        $deleteSparePart->handle($request->user(), $sparePart);

        return new JsonResponse(null, 204);
    }
}
