<?php

namespace App\Http\Controllers;

use App\Actions\Tires\CreateTire;
use App\Actions\Tires\DeleteTire;
use App\Actions\Tires\UpdateTire;
use App\Http\Controllers\Concerns\AuthorizesCompanyResource;
use App\Http\Requests\TireStoreRequest;
use App\Http\Requests\TireUpdateRequest;
use App\Http\Resources\TireResource;
use App\Models\Tire;
use App\Queries\Tires\TireIndexQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TireController extends Controller
{
    use AuthorizesCompanyResource;

    public function index(Request $request, TireIndexQuery $indexQuery)
    {
        $tires = $indexQuery->handle($request, $request->user())->get();

        return TireResource::collection($tires);
    }

    public function store(TireStoreRequest $request, CreateTire $createTire)
    {
        $this->authorizeCompanyWrite($request);

        $tire = $createTire->handle($request->user(), $request->validated());

        return TireResource::make($tire)->response()->setStatusCode(201);
    }

    public function show(Request $request, Tire $tire)
    {
        $this->authorizeCompanyRead($request, $tire);

        return TireResource::make($tire->load('type'));
    }

    public function update(TireUpdateRequest $request, Tire $tire, UpdateTire $updateTire)
    {
        $this->authorizeCompanyRead($request, $tire);
        $this->authorizeCompanyWrite($request);

        $tire = $updateTire->handle($request->user(), $tire, $request->validated());

        return TireResource::make($tire->load('type'));
    }

    public function destroy(Request $request, Tire $tire, DeleteTire $deleteTire)
    {
        $this->authorizeCompanyRead($request, $tire);
        $this->authorizeCompanyWrite($request);

        $deleteTire->handle($request->user(), $tire);

        return new JsonResponse(null, 204);
    }
}
