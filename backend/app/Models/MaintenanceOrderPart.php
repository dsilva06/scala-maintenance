<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaintenanceOrderPart extends Model
{
    /** @use HasFactory<\Database\Factories\MaintenanceOrderPartFactory> */
    use HasFactory;

    protected $fillable = [
        'maintenance_order_id',
        'spare_part_id',
        'company_id',
        'name_snapshot',
        'sku_snapshot',
        'category_snapshot',
        'quantity',
        'unit_cost',
        'total_cost',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
    ];

    public function maintenanceOrder()
    {
        return $this->belongsTo(MaintenanceOrder::class);
    }

    public function sparePart()
    {
        return $this->belongsTo(SparePart::class);
    }
}
