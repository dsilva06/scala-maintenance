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
        Schema::create('maintenance_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vehicle_id')->nullable()->constrained()->nullOnDelete();
            $table->string('order_number');
            $table->string('type')->default('preventivo');
            $table->string('status')->default('pendiente');
            $table->string('priority')->default('media');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('mechanic')->nullable();
            $table->dateTime('scheduled_date')->nullable();
            $table->dateTime('completion_date')->nullable();
            $table->decimal('estimated_cost', 12, 2)->nullable();
            $table->decimal('actual_cost', 12, 2)->nullable();
            $table->text('notes')->nullable();
            $table->json('tasks')->nullable();
            $table->json('parts')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'order_number']);
            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'priority']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_orders');
    }
};
