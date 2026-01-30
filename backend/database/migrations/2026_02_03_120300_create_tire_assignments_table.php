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
        Schema::create('tire_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('tire_id')->constrained('tires')->cascadeOnDelete();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->foreignId('tire_position_id')->constrained('tire_positions')->cascadeOnDelete();
            $table->dateTime('mounted_at')->nullable();
            $table->unsignedInteger('mounted_mileage')->nullable();
            $table->dateTime('dismounted_at')->nullable();
            $table->unsignedInteger('dismounted_mileage')->nullable();
            $table->string('reason')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'tire_id'], 'tire_assignments_company_tire_index');
            $table->index(['company_id', 'vehicle_id'], 'tire_assignments_company_vehicle_index');
            $table->index(['company_id', 'tire_position_id'], 'tire_assignments_company_position_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tire_assignments');
    }
};
