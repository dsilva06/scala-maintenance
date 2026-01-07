<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiMessage extends Model
{
    /** @use HasFactory<\Database\Factories\AiMessageFactory> */
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'user_id',
        'role',
        'content',
        'provider',
        'model',
        'prompt_tokens',
        'completion_tokens',
        'status',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'prompt_tokens' => 'integer',
        'completion_tokens' => 'integer',
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
