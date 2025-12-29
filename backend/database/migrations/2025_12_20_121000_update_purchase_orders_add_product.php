<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->string('product_name')->nullable()->after('supplier');
            $table->renameColumn('total_amount', 'total_cost');
        });
    }

    public function down(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->renameColumn('total_cost', 'total_amount');
            $table->dropColumn('product_name');
        });
    }
};
