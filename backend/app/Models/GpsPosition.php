<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GpsPosition extends Model
{
    /** @use HasFactory<\Database\Factories\GpsPositionFactory> */
    use HasFactory;

    protected $fillable = [
        'company_id',
        'user_id',
        'vehicle_id',
        'trip_id',
        'latitude',
        'longitude',
        'speed_kph',
        'heading',
        'altitude',
        'accuracy',
        'recorded_at',
        'metadata',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'speed_kph' => 'float',
        'heading' => 'float',
        'altitude' => 'float',
        'accuracy' => 'float',
        'recorded_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }
}
