<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiMemory extends Model
{
    /** @use HasFactory<\Database\Factories\AiMemoryFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_id',
        'entity_type',
        'entity_id',
        'action',
        'summary',
        'search_text',
        'data',
        'importance',
    ];

    protected $casts = [
        'data' => 'array',
        'importance' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
