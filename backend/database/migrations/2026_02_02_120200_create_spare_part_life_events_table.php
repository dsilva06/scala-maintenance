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
        Schema::create('spare_part_life_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('spare_part_id')->constrained('spare_parts')->cascadeOnDelete();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->foreignId('maintenance_order_id')->constrained('maintenance_orders')->cascadeOnDelete();
            $table->unsignedInteger('completion_mileage');
            $table->unsignedInteger('delta_km')->nullable();
            $table->unsignedInteger('quantity')->default(1);
            $table->unsignedInteger('expected_life_km')->nullable();
            $table->timestamps();

            $table->unique(
                ['company_id', 'spare_part_id', 'vehicle_id', 'maintenance_order_id'],
                'spare_part_life_event_unique'
            );
            $table->index(['company_id', 'spare_part_id'], 'spare_part_life_event_company_part_index');
            $table->index(['company_id', 'vehicle_id'], 'spare_part_life_event_company_vehicle_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spare_part_life_events');
    }
};
