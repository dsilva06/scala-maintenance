<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_order_parts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('maintenance_order_id')->constrained('maintenance_orders')->cascadeOnDelete();
            $table->foreignId('spare_part_id')->nullable()->constrained('spare_parts')->nullOnDelete();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name_snapshot')->nullable();
            $table->string('sku_snapshot')->nullable();
            $table->string('category_snapshot')->nullable();
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('unit_cost', 12, 2)->nullable();
            $table->decimal('total_cost', 12, 2)->nullable();
            $table->timestamps();

            $table->index(['company_id', 'maintenance_order_id']);
            $table->index(['company_id', 'spare_part_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_order_parts');
    }
};
