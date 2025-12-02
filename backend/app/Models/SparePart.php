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
        'sku',
        'part_number',
        'name',
        'photo_url',
        'brand',
        'category',
        'current_stock',
        'minimum_stock',
        'maximum_stock',
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
        'unit_cost' => 'decimal:2',
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
