<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    /** @use HasFactory<\Database\Factories\VehicleFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plate',
        'brand',
        'model',
        'year',
        'color',
        'vin',
        'current_mileage',
        'vehicle_type',
        'status',
        'fuel_type',
        'last_service_date',
        'next_service_date',
        'assigned_driver',
        'metadata',
    ];

    protected $casts = [
        'year' => 'integer',
        'current_mileage' => 'integer',
        'last_service_date' => 'date',
        'next_service_date' => 'date',
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function maintenanceOrders()
    {
        return $this->hasMany(MaintenanceOrder::class);
    }

    public function inspections()
    {
        return $this->hasMany(Inspection::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function trips()
    {
        return $this->hasMany(Trip::class);
    }
}
