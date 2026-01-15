<?php

namespace App\Http\Controllers;

use App\Http\Requests\SupplierStoreRequest;
use App\Http\Requests\SupplierUpdateRequest;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use App\Queries\Suppliers\SupplierIndexQuery;
use App\Actions\Suppliers\CreateSupplier;
use App\Actions\Suppliers\DeleteSupplier;
use App\Actions\Suppliers\UpdateSupplier;
use App\Http\Controllers\Concerns\AuthorizesCompanyResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    use AuthorizesCompanyResource;

    public function index(Request $request, SupplierIndexQuery $supplierIndexQuery)
    {
        $suppliers = $supplierIndexQuery
            ->handle($request, $request->user())
            ->get();

        return SupplierResource::collection($suppliers);
    }

    public function store(SupplierStoreRequest $request, CreateSupplier $createSupplier)
    {
        $this->authorizeCompanyWrite($request);
        $supplier = $createSupplier->handle($request->user(), $request->validated());

        return SupplierResource::make($supplier)->response()->setStatusCode(201);
    }

    public function show(Request $request, Supplier $supplier)
    {
        $this->authorizeCompanyRead($request, $supplier);

        return SupplierResource::make($supplier);
    }

    public function update(SupplierUpdateRequest $request, Supplier $supplier, UpdateSupplier $updateSupplier)
    {
        $this->authorizeCompanyRead($request, $supplier);
        $this->authorizeCompanyWrite($request);

        $supplier = $updateSupplier->handle($request->user(), $supplier, $request->validated());

        return SupplierResource::make($supplier);
    }

    public function destroy(Request $request, Supplier $supplier, DeleteSupplier $deleteSupplier)
    {
        $this->authorizeCompanyRead($request, $supplier);
        $this->authorizeCompanyWrite($request);

        $deleteSupplier->handle($request->user(), $supplier);

        return new JsonResponse(null, 204);
    }
}
