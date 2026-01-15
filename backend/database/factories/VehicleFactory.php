<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Vehicle>
 */
class VehicleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $plate = Str::upper($this->faker->bothify('??#-###'));

        return [
            'user_id' => User::factory(),
            'company_id' => fn (array $attributes) => User::find($attributes['user_id'])?->company_id,
            'plate' => $plate,
            'brand' => $this->faker->randomElement(['Volvo', 'Scania', 'Mercedes-Benz', 'Ford', 'Iveco']),
            'model' => $this->faker->randomElement(['FH', 'G-Series', 'Actros', 'Cargo', 'Eurocargo']),
            'year' => $this->faker->numberBetween(2000, (int) date('Y') + 1),
            'color' => $this->faker->safeColorName(),
            'vin' => Str::upper($this->faker->bothify('???################')), 
            'current_mileage' => $this->faker->numberBetween(0, 500_000),
            'vehicle_type' => $this->faker->randomElement(['carga', 'pasajeros', 'especial']),
            'status' => $this->faker->randomElement(['activo', 'mantenimiento', 'fuera_servicio']),
            'fuel_type' => $this->faker->randomElement(['diesel', 'gasolina', 'electrico', 'hibrido']),
            'last_service_date' => $this->faker->optional()->dateTimeBetween('-1 year', 'now'),
            'next_service_date' => $this->faker->optional()->dateTimeBetween('now', '+1 year'),
            'assigned_driver' => $this->faker->optional()->name(),
            'metadata' => [
                'gps_id' => $this->faker->uuid(),
            ],
        ];
    }
}
