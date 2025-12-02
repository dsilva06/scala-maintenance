<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trip extends Model
{
    /** @use HasFactory<\Database\Factories\TripFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'vehicle_id',
        'driver_id',
        'driver_name',
        'origin',
        'destination',
        'origin_coords',
        'destination_coords',
        'start_date',
        'estimated_arrival',
        'distance_planned',
        'status',
        'cargo_description',
        'cargo_weight',
        'planned_route',
        'metadata',
    ];

    protected $casts = [
        'origin_coords' => 'array',
        'destination_coords' => 'array',
        'planned_route' => 'array',
        'start_date' => 'datetime',
        'estimated_arrival' => 'datetime',
        'distance_planned' => 'integer',
        'cargo_weight' => 'decimal:2',
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
