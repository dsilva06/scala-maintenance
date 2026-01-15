<?php

namespace Database\Factories;

use App\Models\Trip;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\GpsPosition>
 */
class GpsPositionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'company_id' => fn (array $attributes) => User::find($attributes['user_id'])?->company_id,
            'vehicle_id' => fn (array $attributes) => Vehicle::factory()->create([
                'user_id' => $attributes['user_id'],
                'company_id' => User::find($attributes['user_id'])?->company_id,
            ])->id,
            'trip_id' => fn (array $attributes) => Trip::factory()->create([
                'user_id' => $attributes['user_id'],
                'company_id' => User::find($attributes['user_id'])?->company_id,
                'vehicle_id' => $attributes['vehicle_id'],
            ])->id,
            'latitude' => $this->faker->latitude(),
            'longitude' => $this->faker->longitude(),
            'speed_kph' => $this->faker->optional()->randomFloat(2, 0, 140),
            'heading' => $this->faker->optional()->randomFloat(2, 0, 360),
            'altitude' => $this->faker->optional()->randomFloat(2, 0, 4000),
            'accuracy' => $this->faker->optional()->randomFloat(2, 0, 15),
            'recorded_at' => $this->faker->dateTimeBetween('-2 hours', 'now'),
            'metadata' => [
                'source' => 'factory',
            ],
        ];
    }
}
