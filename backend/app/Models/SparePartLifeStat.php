<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SparePartLifeStat extends Model
{
    /** @use HasFactory<\Database\Factories\SparePartLifeStatFactory> */
    use HasFactory;

    protected $fillable = [
        'company_id',
        'spare_part_id',
        'last_event_at',
        'last_completion_mileage',
        'last_delta_km',
        'last_expected_life_km',
        'last_ratio',
        'median_delta_km',
        'average_delta_km',
        'sample_count',
    ];

    protected $casts = [
        'last_event_at' => 'datetime',
        'last_completion_mileage' => 'integer',
        'last_delta_km' => 'integer',
        'last_expected_life_km' => 'integer',
        'last_ratio' => 'decimal:4',
        'median_delta_km' => 'integer',
        'average_delta_km' => 'integer',
        'sample_count' => 'integer',
    ];

    public function sparePart()
    {
        return $this->belongsTo(SparePart::class);
    }
}
