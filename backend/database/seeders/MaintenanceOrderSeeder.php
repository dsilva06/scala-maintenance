<?php

namespace Database\Seeders;

use App\Models\MaintenanceOrder;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class MaintenanceOrderSeeder extends Seeder
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
                $vehicles = Vehicle::factory()->count(3)->for($user)->create();

                $vehicles->each(function (Vehicle $vehicle) use ($user) {
                    MaintenanceOrder::factory()
                        ->count(2)
                        ->for($user)
                        ->for($vehicle)
                        ->create([
                            'status' => 'pendiente',
                        ]);
                });
            });
    }
}
