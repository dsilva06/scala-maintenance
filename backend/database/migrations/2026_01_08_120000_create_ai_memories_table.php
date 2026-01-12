<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_memories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('entity_type', 80);
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->string('action', 80)->nullable();
            $table->string('summary', 255);
            $table->text('search_text')->nullable();
            $table->json('data')->nullable();
            $table->unsignedTinyInteger('importance')->default(3);
            $table->timestamps();

            $table->unique(['user_id', 'entity_type', 'entity_id']);
            $table->index(['user_id', 'entity_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_memories');
    }
};
