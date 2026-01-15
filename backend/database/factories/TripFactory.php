<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Trip>
 */
class TripFactory extends Factory
{
    /**
     * Define the model's default state.
     *
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
            'driver_id' => $this->faker->optional()->uuid(),
            'driver_name' => $this->faker->name(),
            'origin' => $this->faker->city(),
            'destination' => $this->faker->city(),
            'origin_coords' => [
                'lat' => $this->faker->latitude(),
                'lng' => $this->faker->longitude(),
            ],
            'destination_coords' => [
                'lat' => $this->faker->latitude(),
                'lng' => $this->faker->longitude(),
            ],
            'start_date' => $this->faker->dateTimeBetween('-2 days', 'now'),
            'estimated_arrival' => $this->faker->dateTimeBetween('now', '+2 days'),
            'distance_planned' => $this->faker->numberBetween(50, 1200),
            'status' => $this->faker->randomElement(['planificado', 'en_curso', 'completado', 'cancelado']),
            'cargo_description' => $this->faker->optional()->sentence(),
            'cargo_weight' => $this->faker->optional()->randomFloat(2, 100, 25000),
            'planned_route' => [
                ['lat' => $this->faker->latitude(), 'lng' => $this->faker->longitude()],
                ['lat' => $this->faker->latitude(), 'lng' => $this->faker->longitude()],
            ],
            'metadata' => [
                'priority' => $this->faker->randomElement(['low', 'normal', 'high']),
            ],
        ];
    }
}
