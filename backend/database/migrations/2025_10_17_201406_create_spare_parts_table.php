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
        Schema::create('spare_parts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('sku');
            $table->string('part_number')->nullable();
            $table->string('name');
            $table->text('photo_url')->nullable();
            $table->string('brand')->nullable();
            $table->string('category')->nullable();
            $table->unsignedInteger('current_stock')->default(0);
            $table->unsignedInteger('minimum_stock')->default(0);
            $table->unsignedInteger('maximum_stock')->default(0);
            $table->decimal('unit_cost', 12, 2)->nullable();
            $table->string('supplier')->nullable();
            $table->string('storage_location')->nullable();
            $table->string('status')->default('disponible');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'sku']);
            $table->unique(['user_id', 'part_number']);
            $table->index(['user_id', 'category']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spare_parts');
    }
};
