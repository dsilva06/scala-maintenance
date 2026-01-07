<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    /** @use HasFactory<\Database\Factories\PlanFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'provider',
        'model',
        'monthly_message_limit',
        'features',
        'price_monthly',
    ];

    protected $casts = [
        'features' => 'array',
        'monthly_message_limit' => 'integer',
        'price_monthly' => 'decimal:2',
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
}
