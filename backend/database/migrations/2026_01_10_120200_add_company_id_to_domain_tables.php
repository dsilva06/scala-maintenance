<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $tables = [
            'vehicles',
            'maintenance_orders',
            'spare_parts',
            'inspections',
            'documents',
            'trips',
            'repair_guides',
            'alerts',
            'suppliers',
            'purchase_orders',
            'ai_conversations',
            'ai_messages',
            'ai_actions',
            'ai_memories',
            'subscriptions',
        ];

        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $tableBlueprint) {
                $tableBlueprint->foreignId('company_id')
                    ->nullable()
                    ->after('user_id')
                    ->constrained()
                    ->cascadeOnDelete();
            });
        }

        foreach ($tables as $table) {
            DB::table($table)
                ->whereNull('company_id')
                ->update([
                    'company_id' => DB::raw("(select company_id from users where users.id = {$table}.user_id)"),
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'vehicles',
            'maintenance_orders',
            'spare_parts',
            'inspections',
            'documents',
            'trips',
            'repair_guides',
            'alerts',
            'suppliers',
            'purchase_orders',
            'ai_conversations',
            'ai_messages',
            'ai_actions',
            'ai_memories',
            'subscriptions',
        ];

        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $tableBlueprint) {
                $tableBlueprint->dropConstrainedForeignId('company_id');
            });
        }
    }
};
