<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    /** @use HasFactory<\Database\Factories\PurchaseOrderFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_id',
        'order_number',
        'supplier',
        'supplier_id',
        'product_name',
        'spare_part_id',
        'status',
        'priority',
        'total_cost',
        'items_count',
        'expected_date',
        'received_at',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'total_cost' => 'decimal:2',
        'items_count' => 'integer',
        'expected_date' => 'date',
        'received_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function sparePart()
    {
        return $this->belongsTo(SparePart::class);
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }
}
