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
        Schema::create('trips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vehicle_id')->nullable()->constrained()->nullOnDelete();
            $table->string('driver_id')->nullable();
            $table->string('driver_name')->nullable();
            $table->string('origin')->nullable();
            $table->string('destination')->nullable();
            $table->json('origin_coords')->nullable();
            $table->json('destination_coords')->nullable();
            $table->dateTime('start_date')->nullable();
            $table->dateTime('estimated_arrival')->nullable();
            $table->unsignedInteger('distance_planned')->nullable();
            $table->string('status')->default('planificado');
            $table->text('cargo_description')->nullable();
            $table->decimal('cargo_weight', 10, 2)->nullable();
            $table->json('planned_route')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trips');
    }
};
