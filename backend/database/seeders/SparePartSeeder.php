<?php

namespace Database\Seeders;

use App\Models\SparePart;
use App\Models\User;
use Illuminate\Database\Seeder;

class SparePartSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()
            ->count(2)
            ->create()
            ->each(function (User $user) {
                SparePart::factory()->count(10)->for($user)->create();
            });
    }
}
