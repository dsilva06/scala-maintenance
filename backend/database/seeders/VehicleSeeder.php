<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class VehicleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()
            ->count(2)
            ->has(Vehicle::factory()->count(5))
            ->create();

        if (User::count() === 0) {
            User::factory()->create();
        }
    }
}
