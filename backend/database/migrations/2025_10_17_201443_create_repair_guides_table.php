<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('repair_guides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description');
            $table->string('category')->nullable();
            $table->string('type')->default('correctivo');
            $table->string('priority')->default('media');
            $table->string('difficulty')->default('intermedio');
            $table->decimal('estimated_time_hours', 5, 2)->nullable();
            $table->json('steps');
            $table->json('required_parts')->nullable();
            $table->json('keywords')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'category']);
            $table->index(['user_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('repair_guides');
    }
};
