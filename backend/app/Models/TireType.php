<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TireType extends Model
{
    /** @use HasFactory<\Database\Factories\TireTypeFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_id',
        'name',
        'brand',
        'model',
        'size',
        'usage',
        'pressure_target_psi',
        'pressure_tolerance_pct',
        'notes',
    ];

    protected $casts = [
        'pressure_target_psi' => 'decimal:2',
        'pressure_tolerance_pct' => 'integer',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tires()
    {
        return $this->hasMany(Tire::class);
    }
}
