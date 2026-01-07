<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiConversation extends Model
{
    /** @use HasFactory<\Database\Factories\AiConversationFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'metadata',
        'last_message_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'last_message_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function messages()
    {
        return $this->hasMany(AiMessage::class, 'conversation_id')->orderBy('created_at');
    }

    public function actions()
    {
        return $this->hasMany(AiAction::class, 'conversation_id')->orderBy('created_at');
    }
}
