<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnalyticsEvent extends Model
{
    /** @use HasFactory<\Database\Factories\AnalyticsEventFactory> */
    use HasFactory;

    protected $fillable = [
        'company_id',
        'user_id',
        'event_name',
        'event_category',
        'entity_type',
        'entity_id',
        'occurred_at',
        'payload',
        'metadata',
        'source',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'occurred_at' => 'datetime',
        'payload' => 'array',
        'metadata' => 'array',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
