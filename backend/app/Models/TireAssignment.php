<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TireAssignment extends Model
{
    /** @use HasFactory<\Database\Factories\TireAssignmentFactory> */
    use HasFactory;

    protected $fillable = [
        'company_id',
        'tire_id',
        'vehicle_id',
        'tire_position_id',
        'mounted_at',
        'mounted_mileage',
        'dismounted_at',
        'dismounted_mileage',
        'reason',
    ];

    protected $casts = [
        'mounted_at' => 'datetime',
        'dismounted_at' => 'datetime',
        'mounted_mileage' => 'integer',
        'dismounted_mileage' => 'integer',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function tire()
    {
        return $this->belongsTo(Tire::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function position()
    {
        return $this->belongsTo(TirePosition::class, 'tire_position_id');
    }

    public function inspections()
    {
        return $this->hasMany(TireInspection::class);
    }
}
