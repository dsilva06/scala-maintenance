<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SparePartLifeEvent extends Model
{
    /** @use HasFactory<\Database\Factories\SparePartLifeEventFactory> */
    use HasFactory;

    protected $fillable = [
        'company_id',
        'spare_part_id',
        'vehicle_id',
        'maintenance_order_id',
        'completion_mileage',
        'delta_km',
        'quantity',
        'expected_life_km',
    ];

    protected $casts = [
        'completion_mileage' => 'integer',
        'delta_km' => 'integer',
        'quantity' => 'integer',
        'expected_life_km' => 'integer',
    ];

    public function sparePart()
    {
        return $this->belongsTo(SparePart::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function maintenanceOrder()
    {
        return $this->belongsTo(MaintenanceOrder::class);
    }
}
