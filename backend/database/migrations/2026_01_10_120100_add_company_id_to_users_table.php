<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('id')->constrained()->nullOnDelete();
        });

        if (!Schema::hasTable('companies')) {
            return;
        }

        $userCount = DB::table('users')->count();
        if ($userCount === 0) {
            return;
        }

        $companyId = DB::table('companies')->insertGetId([
            'name' => 'Default Company',
            'slug' => Str::slug('Default Company'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('users')
            ->whereNull('company_id')
            ->update(['company_id' => $companyId]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('company_id');
        });
    }
};
