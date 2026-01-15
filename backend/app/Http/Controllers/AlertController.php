<?php

namespace App\Http\Controllers;

use App\Actions\Alerts\CreateAlert;
use App\Actions\Alerts\DeleteAlert;
use App\Actions\Alerts\UpdateAlert;
use App\Http\Controllers\Concerns\AuthorizesCompanyResource;
use App\Http\Resources\AlertResource;
use App\Models\Alert;
use App\Queries\Alerts\AlertIndexQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\AlertStoreRequest;
use App\Http\Requests\AlertUpdateRequest;

class AlertController extends Controller
{
    use AuthorizesCompanyResource;

    public function index(Request $request, AlertIndexQuery $alertIndexQuery)
    {
        $alerts = $alertIndexQuery
            ->handle($request, $request->user())
            ->get();

        return AlertResource::collection($alerts);
    }

    public function store(AlertStoreRequest $request, CreateAlert $createAlert)
    {
        $this->authorizeCompanyWrite($request);
        $alert = $createAlert->handle($request->user(), $request->validated());

        return AlertResource::make($alert)->response()->setStatusCode(201);
    }

    public function show(Request $request, Alert $alert)
    {
        $this->authorizeCompanyRead($request, $alert);

        return AlertResource::make($alert);
    }

    public function update(AlertUpdateRequest $request, Alert $alert, UpdateAlert $updateAlert)
    {
        $this->authorizeCompanyRead($request, $alert);
        $this->authorizeCompanyWrite($request);

        $alert = $updateAlert->handle($request->user(), $alert, $request->validated());

        return AlertResource::make($alert);
    }

    public function destroy(Request $request, Alert $alert, DeleteAlert $deleteAlert)
    {
        $this->authorizeCompanyRead($request, $alert);
        $this->authorizeCompanyWrite($request);

        $deleteAlert->handle($request->user(), $alert);

        return new JsonResponse(null, 204);
    }
}
