<?php

namespace App\Http\Controllers;

use App\Actions\TireTypes\CreateTireType;
use App\Actions\TireTypes\DeleteTireType;
use App\Actions\TireTypes\UpdateTireType;
use App\Http\Controllers\Concerns\AuthorizesCompanyResource;
use App\Http\Requests\TireTypeStoreRequest;
use App\Http\Requests\TireTypeUpdateRequest;
use App\Http\Resources\TireTypeResource;
use App\Models\TireType;
use App\Queries\TireTypes\TireTypeIndexQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TireTypeController extends Controller
{
    use AuthorizesCompanyResource;

    public function index(Request $request, TireTypeIndexQuery $indexQuery)
    {
        $types = $indexQuery->handle($request, $request->user())->get();

        return TireTypeResource::collection($types);
    }

    public function store(TireTypeStoreRequest $request, CreateTireType $createTireType)
    {
        $this->authorizeCompanyWrite($request);

        $type = $createTireType->handle($request->user(), $request->validated());

        return TireTypeResource::make($type)->response()->setStatusCode(201);
    }

    public function show(Request $request, TireType $tireType)
    {
        $this->authorizeCompanyRead($request, $tireType);

        return TireTypeResource::make($tireType);
    }

    public function update(TireTypeUpdateRequest $request, TireType $tireType, UpdateTireType $updateTireType)
    {
        $this->authorizeCompanyRead($request, $tireType);
        $this->authorizeCompanyWrite($request);

        $tireType = $updateTireType->handle($request->user(), $tireType, $request->validated());

        return TireTypeResource::make($tireType);
    }

    public function destroy(Request $request, TireType $tireType, DeleteTireType $deleteTireType)
    {
        $this->authorizeCompanyRead($request, $tireType);
        $this->authorizeCompanyWrite($request);

        $deleteTireType->handle($request->user(), $tireType);

        return new JsonResponse(null, 204);
    }
}
