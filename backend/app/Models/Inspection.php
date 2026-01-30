<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inspection extends Model
{
    /** @use HasFactory<\Database\Factories\InspectionFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_id',
        'vehicle_id',
        'inspection_date',
        'inspector',
        'mileage',
        'overall_status',
        'notes',
        'checklist_items',
        'attachments',
        'metadata',
    ];

    protected $casts = [
        'inspection_date' => 'date',
        'mileage' => 'integer',
        'checklist_items' => 'array',
        'attachments' => 'array',
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

    public function tireInspections()
    {
        return $this->hasMany(TireInspection::class);
    }
}
