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
        Schema::create('tire_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('size')->nullable();
            $table->decimal('pressure_target_psi', 6, 2)->nullable();
            $table->unsignedInteger('pressure_tolerance_pct')->default(10);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'name'], 'tire_types_company_name_index');
            $table->index(['user_id', 'name'], 'tire_types_user_name_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tire_types');
    }
};
