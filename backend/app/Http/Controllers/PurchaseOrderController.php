<?php

namespace App\Http\Controllers;

use App\Actions\PurchaseOrders\CreatePurchaseOrder;
use App\Actions\PurchaseOrders\DeletePurchaseOrder;
use App\Actions\PurchaseOrders\UpdatePurchaseOrder;
use App\Http\Controllers\Concerns\AuthorizesCompanyResource;
use App\Http\Requests\PurchaseOrderStoreRequest;
use App\Http\Requests\PurchaseOrderUpdateRequest;
use App\Http\Resources\PurchaseOrderResource;
use App\Models\PurchaseOrder;
use App\Queries\PurchaseOrders\PurchaseOrderIndexQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PurchaseOrderController extends Controller
{
    use AuthorizesCompanyResource;

    public function index(Request $request, PurchaseOrderIndexQuery $purchaseOrderIndexQuery)
    {
        $orders = $purchaseOrderIndexQuery
            ->handle($request, $request->user())
            ->get();

        return PurchaseOrderResource::collection($orders);
    }

    public function store(PurchaseOrderStoreRequest $request, CreatePurchaseOrder $createPurchaseOrder)
    {
        $this->authorizeCompanyWrite($request);
        $order = $createPurchaseOrder->handle($request->user(), $request->validated());

        return PurchaseOrderResource::make($order)->response()->setStatusCode(201);
    }

    public function show(Request $request, PurchaseOrder $purchaseOrder)
    {
        $this->authorizeCompanyRead($request, $purchaseOrder);

        $purchaseOrder->load('items');

        return PurchaseOrderResource::make($purchaseOrder);
    }

    public function update(
        PurchaseOrderUpdateRequest $request,
        PurchaseOrder $purchaseOrder,
        UpdatePurchaseOrder $updatePurchaseOrder
    )
    {
        $this->authorizeCompanyRead($request, $purchaseOrder);
        $this->authorizeCompanyWrite($request);

        $purchaseOrder = $updatePurchaseOrder->handle(
            $request->user(),
            $purchaseOrder,
            $request->validated()
        );

        return PurchaseOrderResource::make($purchaseOrder);
    }

    public function destroy(
        Request $request,
        PurchaseOrder $purchaseOrder,
        DeletePurchaseOrder $deletePurchaseOrder
    )
    {
        $this->authorizeCompanyRead($request, $purchaseOrder);
        $this->authorizeCompanyWrite($request);

        $deletePurchaseOrder->handle($request->user(), $purchaseOrder);

        return new JsonResponse(null, 204);
    }
}
