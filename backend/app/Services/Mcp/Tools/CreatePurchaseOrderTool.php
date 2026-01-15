<?php

namespace App\Services\Mcp\Tools;

use App\Models\PurchaseOrder;
use App\Models\SparePart;
use App\Models\Supplier;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\Mcp\Contracts\ToolInterface;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CreatePurchaseOrderTool implements ToolInterface
{
    public function __construct(private AuditLogger $auditLogger)
    {
    }

    public function getName(): string
    {
        return 'create_purchase_order';
    }

    public function getDescription(): string
    {
        return 'Crea una orden de compra con proveedor y numero de orden.';
    }

    public function getInputSchema(): array
    {
        return [
            'type' => 'object',
            'required' => ['order_number'],
            'properties' => [
                'order_number' => ['type' => 'string'],
                'supplier' => ['type' => 'string'],
                'supplier_id' => ['type' => 'integer'],
                'product_name' => ['type' => 'string'],
                'status' => ['type' => 'string'],
                'priority' => ['type' => 'string'],
                'total_cost' => ['type' => 'number'],
                'items_count' => ['type' => 'integer'],
                'expected_date' => ['type' => 'string', 'format' => 'date'],
                'spare_part_id' => ['type' => 'integer'],
                'notes' => ['type' => 'string'],
            ],
        ];
    }

    public function validateArguments(array $arguments, User $user): array
    {
        if (!$user->canManageCompany()) {
            throw ValidationException::withMessages([
                'role' => ['No tienes permisos para crear ordenes de compra.'],
            ]);
        }

        $validator = Validator::make($arguments, [
            'order_number' => [
                'required',
                'string',
                'max:120',
                Rule::unique('purchase_orders', 'order_number')->where('company_id', $user->company_id),
            ],
            'supplier' => ['required_without:supplier_id', 'string', 'max:150'],
            'supplier_id' => [
                'nullable',
                'integer',
                Rule::exists('suppliers', 'id')->where('company_id', $user->company_id),
            ],
            'product_name' => ['nullable', 'string', 'max:150'],
            'status' => ['nullable', 'string', 'max:50'],
            'priority' => ['nullable', 'string', 'max:50'],
            'total_cost' => ['nullable', 'numeric', 'min:0'],
            'items_count' => ['nullable', 'integer', 'min:0'],
            'expected_date' => ['nullable', 'date'],
            'spare_part_id' => [
                'nullable',
                'integer',
                Rule::exists('spare_parts', 'id')->where('company_id', $user->company_id),
            ],
            'notes' => ['nullable', 'string'],
        ]);

        $validated = $validator->validate();

        foreach (['order_number', 'supplier', 'product_name', 'status', 'priority', 'notes'] as $key) {
            if (array_key_exists($key, $validated) && is_string($validated[$key])) {
                $validated[$key] = trim($validated[$key]);
            }
        }

        $validated['order_number'] = strtoupper($validated['order_number']);

        if (!empty($validated['supplier_id']) && empty($validated['supplier'])) {
            $supplierName = Supplier::where('id', $validated['supplier_id'])
                ->where('company_id', $user->company_id)
                ->value('name');

            if ($supplierName) {
                $validated['supplier'] = $supplierName;
            }
        }

        return $validated;
    }

    public function invoke(array $arguments, User $user): array
    {
        $validated = $this->validateArguments($arguments, $user);

        $payload = $validated;
        $payload['company_id'] = $user->company_id;
        $order = $user->purchaseOrders()->create($payload);
        $this->applyInventoryReceipt($order);

        $this->auditLogger->record(
            $user,
            'purchase_order.created',
            $order,
            [],
            $this->auditLogger->snapshot($order),
            ['source' => 'mcp']
        );

        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'supplier' => $order->supplier,
            'status' => $order->status,
            'priority' => $order->priority,
            'total_cost' => $order->total_cost,
            'expected_date' => optional($order->expected_date)->toIso8601String(),
        ];
    }

    protected function applyInventoryReceipt(PurchaseOrder $order): void
    {
        if ($order->status !== 'received') {
            return;
        }

        if (! $order->spare_part_id) {
            return;
        }

        $quantity = max(0, (int) $order->items_count);

        if ($quantity <= 0) {
            return;
        }

        $part = SparePart::query()
            ->where('id', $order->spare_part_id)
            ->where('company_id', $order->company_id)
            ->first();

        if (! $part) {
            return;
        }

        $part->increment('current_stock', $quantity);
    }
}
