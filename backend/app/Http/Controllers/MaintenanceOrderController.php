<?php

namespace App\Http\Controllers;

use App\Actions\MaintenanceOrders\CreateMaintenanceOrder;
use App\Actions\MaintenanceOrders\DeleteMaintenanceOrder;
use App\Actions\MaintenanceOrders\UpdateMaintenanceOrder;
use App\Http\Controllers\Concerns\AuthorizesCompanyResource;
use App\Http\Resources\MaintenanceOrderResource;
use App\Models\MaintenanceOrder;
use App\Queries\MaintenanceOrders\MaintenanceOrderIndexQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\MaintenanceOrderStoreRequest;
use App\Http\Requests\MaintenanceOrderUpdateRequest;

class MaintenanceOrderController extends Controller
{
    use AuthorizesCompanyResource;

    public function index(Request $request, MaintenanceOrderIndexQuery $maintenanceOrderIndexQuery)
    {
        $orders = $maintenanceOrderIndexQuery
            ->handle($request, $request->user())
            ->get();

        return MaintenanceOrderResource::collection($orders);
    }

    public function store(
        MaintenanceOrderStoreRequest $request,
        CreateMaintenanceOrder $createMaintenanceOrder
    )
    {
        $this->authorizeCompanyWrite($request);
        $order = $createMaintenanceOrder->handle($request->user(), $request->validated());

        return MaintenanceOrderResource::make($order->load('vehicle'))->response()->setStatusCode(201);
    }

    public function show(Request $request, MaintenanceOrder $maintenanceOrder)
    {
        $this->authorizeCompanyRead($request, $maintenanceOrder);

        return MaintenanceOrderResource::make($maintenanceOrder->load('vehicle'));
    }

    public function update(
        MaintenanceOrderUpdateRequest $request,
        MaintenanceOrder $maintenanceOrder,
        UpdateMaintenanceOrder $updateMaintenanceOrder
    )
    {
        $this->authorizeCompanyRead($request, $maintenanceOrder);
        $this->authorizeCompanyWrite($request);

        $maintenanceOrder = $updateMaintenanceOrder->handle(
            $request->user(),
            $maintenanceOrder,
            $request->validated()
        );

        return MaintenanceOrderResource::make($maintenanceOrder->load('vehicle'));
    }

    public function destroy(
        Request $request,
        MaintenanceOrder $maintenanceOrder,
        DeleteMaintenanceOrder $deleteMaintenanceOrder
    )
    {
        $this->authorizeCompanyRead($request, $maintenanceOrder);
        $this->authorizeCompanyWrite($request);

        $deleteMaintenanceOrder->handle($request->user(), $maintenanceOrder);

        return new JsonResponse(null, 204);
    }
}
