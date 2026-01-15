<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    /** @use HasFactory<\Database\Factories\AuditLogFactory> */
    use HasFactory;

    protected $fillable = [
        'company_id',
        'user_id',
        'auditable_type',
        'auditable_id',
        'action',
        'before',
        'after',
        'metadata',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'before' => 'array',
        'after' => 'array',
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

    public function auditable()
    {
        return $this->morphTo();
    }
}
