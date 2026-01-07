<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiAction extends Model
{
    /** @use HasFactory<\Database\Factories\AiActionFactory> */
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'user_id',
        'tool',
        'arguments',
        'status',
        'requires_confirmation',
        'result',
        'error',
        'confirmed_at',
        'executed_at',
        'cancelled_at',
    ];

    protected $casts = [
        'arguments' => 'array',
        'requires_confirmation' => 'boolean',
        'result' => 'array',
        'confirmed_at' => 'datetime',
        'executed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function conversation()
    {
        return $this->belongsTo(AiConversation::class, 'conversation_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
