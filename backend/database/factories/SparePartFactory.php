<?php

namespace Database\Factories;

use App\Models\SparePart;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<SparePart>
 */
class SparePartFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->randomElement([
            'Filtro de aceite',
            'Pastillas de freno',
            'Batería',
            'Neumático 295/80R22.5',
            'Filtro de aire',
            'Correa de alternador',
        ]);

        return [
            'user_id' => User::factory(),
            'sku' => Str::upper($this->faker->bothify('SP-#####')),
            'part_number' => $this->faker->optional()->bothify('PN-####'),
            'name' => $name,
            'photo_url' => $this->faker->optional()->imageUrl(300, 300, 'transport'),
            'brand' => $this->faker->optional()->randomElement(['Bosch', 'Brembo', 'ACDelco', 'Goodyear']),
            'category' => $this->faker->randomElement(['motor', 'frenos', 'neumaticos', 'electrico', 'suspension', 'otros']),
            'current_stock' => $this->faker->numberBetween(0, 50),
            'minimum_stock' => $this->faker->numberBetween(0, 10),
            'maximum_stock' => $this->faker->numberBetween(20, 100),
            'unit_cost' => $this->faker->optional()->randomFloat(2, 10, 500),
            'supplier' => $this->faker->optional()->company(),
            'storage_location' => $this->faker->optional()->lexify('A??-###'),
            'status' => $this->faker->randomElement(['disponible', 'reservado', 'agotado']),
            'metadata' => ['source' => 'factory'],
        ];
    }
}
