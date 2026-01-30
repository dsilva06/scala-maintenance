<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tire extends Model
{
    /** @use HasFactory<\Database\Factories\TireFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_id',
        'tire_type_id',
        'serial',
        'purchase_date',
        'purchase_cost',
        'depth_new_mm',
        'min_depth_mm',
        'status',
        'notes',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'purchase_cost' => 'decimal:2',
        'depth_new_mm' => 'decimal:2',
        'min_depth_mm' => 'decimal:2',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function type()
    {
        return $this->belongsTo(TireType::class, 'tire_type_id');
    }

    public function assignments()
    {
        return $this->hasMany(TireAssignment::class);
    }

    public function inspections()
    {
        return $this->hasMany(TireInspection::class);
    }
}
