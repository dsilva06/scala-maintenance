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
        'order_number',
        'supplier',
        'product_name',
        'status',
        'priority',
        'total_cost',
        'items_count',
        'expected_date',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'total_cost' => 'decimal:2',
        'items_count' => 'integer',
        'expected_date' => 'date',
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
