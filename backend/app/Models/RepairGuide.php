<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RepairGuide extends Model
{
    /** @use HasFactory<\Database\Factories\RepairGuideFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'category',
        'type',
        'priority',
        'difficulty',
        'estimated_time_hours',
        'steps',
        'required_parts',
        'keywords',
        'metadata',
    ];

    protected $casts = [
        'estimated_time_hours' => 'decimal:2',
        'steps' => 'array',
        'required_parts' => 'array',
        'keywords' => 'array',
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
