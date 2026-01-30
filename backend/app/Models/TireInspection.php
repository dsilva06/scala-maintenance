<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TireInspection extends Model
{
    /** @use HasFactory<\Database\Factories\TireInspectionFactory> */
    use HasFactory;

    protected $fillable = [
        'company_id',
        'inspection_id',
        'tire_assignment_id',
        'tire_id',
        'vehicle_id',
        'tire_position_id',
        'inspection_date',
        'mileage',
        'pressure_psi',
        'depth_mm',
        'status',
        'notes',
    ];

    protected $casts = [
        'inspection_date' => 'date',
        'mileage' => 'integer',
        'pressure_psi' => 'decimal:2',
        'depth_mm' => 'decimal:2',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function inspection()
    {
        return $this->belongsTo(Inspection::class);
    }

    public function tire()
    {
        return $this->belongsTo(Tire::class);
    }

    public function assignment()
    {
        return $this->belongsTo(TireAssignment::class, 'tire_assignment_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function position()
    {
        return $this->belongsTo(TirePosition::class, 'tire_position_id');
    }
}
