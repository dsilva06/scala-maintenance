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
        Schema::create('tires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('tire_type_id')->nullable()->constrained('tire_types')->nullOnDelete();
            $table->string('serial');
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_cost', 12, 2)->nullable();
            $table->decimal('depth_new_mm', 6, 2)->nullable();
            $table->decimal('min_depth_mm', 6, 2)->nullable();
            $table->string('status')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'serial'], 'tires_company_serial_unique');
            $table->index(['company_id', 'tire_type_id'], 'tires_company_type_index');
            $table->index(['user_id', 'serial'], 'tires_user_serial_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tires');
    }
};
