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
        Schema::create('tire_positions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->unsignedInteger('axle_index')->default(1);
            $table->string('position_code');
            $table->string('label')->nullable();
            $table->boolean('is_spare')->default(false);
            $table->timestamps();

            $table->index(['company_id', 'vehicle_id'], 'tire_positions_company_vehicle_index');
            $table->index(['vehicle_id', 'axle_index'], 'tire_positions_vehicle_axle_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tire_positions');
    }
};
