<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SparePart extends Model
{
    /** @use HasFactory<\Database\Factories\SparePartFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_id',
        'sku',
        'part_number',
        'name',
        'photo_url',
        'brand',
        'category',
        'current_stock',
        'minimum_stock',
        'maximum_stock',
        'expected_life_km',
        'unit_cost',
        'supplier',
        'storage_location',
        'status',
        'metadata',
    ];

    protected $casts = [
        'current_stock' => 'integer',
        'minimum_stock' => 'integer',
        'maximum_stock' => 'integer',
        'expected_life_km' => 'integer',
        'unit_cost' => 'decimal:2',
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

    public function lifeEvents()
    {
        return $this->hasMany(SparePartLifeEvent::class);
    }

    public function lifeStat()
    {
        return $this->hasOne(SparePartLifeStat::class);
    }

    public function suppliers()
    {
        return $this->belongsToMany(Supplier::class)
            ->withPivot('company_id')
            ->withTimestamps()
            ->when($this->company_id, fn ($query) => $query->wherePivot('company_id', $this->company_id));
    }
}
