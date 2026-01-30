<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TirePosition extends Model
{
    /** @use HasFactory<\Database\Factories\TirePositionFactory> */
    use HasFactory;

    protected $fillable = [
        'company_id',
        'vehicle_id',
        'axle_index',
        'position_code',
        'label',
        'position_role',
        'is_spare',
    ];

    protected $casts = [
        'axle_index' => 'integer',
        'is_spare' => 'boolean',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function assignments()
    {
        return $this->hasMany(TireAssignment::class);
    }
}
