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
        Schema::create('tire_inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('inspection_id')->nullable()->constrained('inspections')->nullOnDelete();
            $table->foreignId('tire_assignment_id')->nullable()->constrained('tire_assignments')->nullOnDelete();
            $table->foreignId('tire_id')->nullable()->constrained('tires')->nullOnDelete();
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->foreignId('tire_position_id')->nullable()->constrained('tire_positions')->nullOnDelete();
            $table->date('inspection_date')->nullable();
            $table->unsignedInteger('mileage')->nullable();
            $table->decimal('pressure_psi', 6, 2)->nullable();
            $table->decimal('depth_mm', 6, 2)->nullable();
            $table->string('status')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'inspection_id'], 'tire_inspections_company_inspection_index');
            $table->index(['company_id', 'tire_id'], 'tire_inspections_company_tire_index');
            $table->index(['company_id', 'vehicle_id'], 'tire_inspections_company_vehicle_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tire_inspections');
    }
};
