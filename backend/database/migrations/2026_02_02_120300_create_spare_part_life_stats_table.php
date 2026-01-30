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
        Schema::create('spare_part_life_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('spare_part_id')->constrained('spare_parts')->cascadeOnDelete();
            $table->timestamp('last_event_at')->nullable();
            $table->unsignedInteger('last_completion_mileage')->nullable();
            $table->unsignedInteger('last_delta_km')->nullable();
            $table->unsignedInteger('last_expected_life_km')->nullable();
            $table->decimal('last_ratio', 6, 4)->nullable();
            $table->unsignedInteger('median_delta_km')->nullable();
            $table->unsignedInteger('average_delta_km')->nullable();
            $table->unsignedInteger('sample_count')->default(0);
            $table->timestamps();

            $table->unique(['company_id', 'spare_part_id'], 'spare_part_life_stats_unique');
            $table->index(['company_id', 'spare_part_id'], 'spare_part_life_stats_company_part_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spare_part_life_stats');
    }
};
