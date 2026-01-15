<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    /** @use HasFactory<\Database\Factories\DocumentFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_id',
        'vehicle_id',
        'document_type',
        'document_number',
        'issuing_entity',
        'issue_date',
        'expiration_date',
        'alert_days_before',
        'status',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'expiration_date' => 'date',
        'alert_days_before' => 'integer',
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

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
