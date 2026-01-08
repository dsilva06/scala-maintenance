<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Http\Requests\PurchaseOrderStoreRequest;
use App\Http\Requests\PurchaseOrderUpdateRequest;
use App\Models\PurchaseOrder;
use App\Models\SparePart;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class PurchaseOrderController extends Controller
{
    use HandlesQueryOptions;

    public function index(Request $request)
    {
        $query = PurchaseOrder::query()
            ->where('user_id', $request->user()->id);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($month = $request->query('month')) {
            try {
                $start = Carbon::parse($month . '-01')->startOfMonth();
                $end = (clone $start)->endOfMonth();
                $query->whereBetween('created_at', [$start, $end]);
            } catch (\Exception $e) {
                // ignore invalid month format
            }
        }

        $this->applyQueryOptions($request, $query, [
            'created_at', 'updated_at', 'expected_date', 'priority', 'status', 'total_cost',
        ], [
            'order_number', 'supplier', 'product_name', 'status', 'priority',
        ]);

        return JsonResource::collection($query->get());
    }

    public function store(PurchaseOrderStoreRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();

        $payload = $this->normalize($validated);
        $payload = $this->applySupplierName($payload, $user->id);

        $order = $user->purchaseOrders()->create($payload);
        $this->applyInventoryReceipt($order, null);

        return JsonResource::make($order)->response()->setStatusCode(201);
    }

    public function show(Request $request, PurchaseOrder $purchaseOrder)
    {
        $this->authorizeOrder($request, $purchaseOrder);

        return JsonResource::make($purchaseOrder);
    }

    public function update(PurchaseOrderUpdateRequest $request, PurchaseOrder $purchaseOrder)
    {
        $this->authorizeOrder($request, $purchaseOrder);

        $validated = $request->validated();

        $previousStatus = $purchaseOrder->status;
        $updates = $this->normalize($validated);
        $updates = $this->applySupplierName($updates, $request->user()->id);

        $purchaseOrder->update($updates);
        $this->applyInventoryReceipt($purchaseOrder, $previousStatus);

        return JsonResource::make($purchaseOrder);
    }

    public function destroy(Request $request, PurchaseOrder $purchaseOrder)
    {
        $this->authorizeOrder($request, $purchaseOrder);

        $purchaseOrder->delete();

        return new JsonResponse(null, 204);
    }

    protected function authorizeOrder(Request $request, PurchaseOrder $order): void
    {
        if ($order->user_id !== $request->user()->id) {
            abort(403, 'No autorizado.');
        }
    }

    protected function normalize(array $attributes): array
    {
        foreach (['order_number', 'supplier', 'product_name', 'status', 'priority', 'notes'] as $key) {
            if (array_key_exists($key, $attributes) && is_string($attributes[$key])) {
                $value = trim($attributes[$key]);
                $attributes[$key] = $value === '' ? null : $value;
                if (in_array($key, ['status', 'priority'], true) && $attributes[$key] !== null) {
                    $attributes[$key] = Str::lower($attributes[$key]);
                }
            }
        }

        return $attributes;
    }

    protected function applySupplierName(array $attributes, int $userId): array
    {
        if (!empty($attributes['supplier_id']) && empty($attributes['supplier'])) {
            $supplierName = Supplier::where('id', $attributes['supplier_id'])
                ->where('user_id', $userId)
                ->value('name');

            if ($supplierName) {
                $attributes['supplier'] = $supplierName;
            }
        }

        return $attributes;
    }

    protected function applyInventoryReceipt(PurchaseOrder $order, ?string $previousStatus): void
    {
        if ($order->status !== 'received') {
            return;
        }

        if ($previousStatus === 'received' || $order->received_at) {
            return;
        }

        if (! $order->spare_part_id) {
            $order->forceFill(['received_at' => now()])->save();
            return;
        }

        $quantity = max(0, (int) $order->items_count);

        if ($quantity <= 0) {
            $order->forceFill(['received_at' => now()])->save();
            return;
        }

        $part = SparePart::query()
            ->where('id', $order->spare_part_id)
            ->where('user_id', $order->user_id)
            ->first();

        if (! $part) {
            return;
        }

        $part->increment('current_stock', $quantity);
        $order->forceFill(['received_at' => now()])->save();
    }
}
