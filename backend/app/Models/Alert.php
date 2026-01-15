<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Alert extends Model
{
    /** @use HasFactory<\Database\Factories\AlertFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_id',
        'type',
        'severity',
        'title',
        'description',
        'status',
        'related_type',
        'related_id',
        'action_data',
        'resolved_by',
        'resolved_at',
        'metadata',
    ];

    protected $casts = [
        'action_data' => 'array',
        'metadata' => 'array',
        'resolved_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function related()
    {
        return $this->morphTo();
    }
}
