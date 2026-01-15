<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaintenanceOrder extends Model
{
    /** @use HasFactory<\Database\Factories\MaintenanceOrderFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_id',
        'vehicle_id',
        'order_number',
        'type',
        'status',
        'priority',
        'title',
        'description',
        'mechanic',
        'scheduled_date',
        'completion_date',
        'completion_mileage',
        'estimated_cost',
        'actual_cost',
        'notes',
        'tasks',
        'parts',
        'metadata',
    ];

    protected $casts = [
        'scheduled_date' => 'datetime',
        'completion_date' => 'datetime',
        'completion_mileage' => 'integer',
        'estimated_cost' => 'decimal:2',
        'actual_cost' => 'decimal:2',
        'tasks' => 'array',
        'parts' => 'array',
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

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
