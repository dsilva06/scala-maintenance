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
        Schema::create('gps_positions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('vehicle_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('trip_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->decimal('speed_kph', 8, 2)->nullable();
            $table->decimal('heading', 6, 2)->nullable();
            $table->decimal('altitude', 8, 2)->nullable();
            $table->decimal('accuracy', 8, 2)->nullable();
            $table->timestamp('recorded_at')->index();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'recorded_at']);
            $table->index(['vehicle_id', 'recorded_at']);
            $table->index(['trip_id', 'recorded_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gps_positions');
    }
};
