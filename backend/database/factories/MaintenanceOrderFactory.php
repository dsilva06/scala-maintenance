<?php

namespace Database\Factories;

use App\Models\MaintenanceOrder;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<MaintenanceOrder>
 */
class MaintenanceOrderFactory extends Factory
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
            'vehicle_id' => null,
            'order_number' => Str::upper('MNT-' . $this->faker->bothify('####')),
            'type' => $this->faker->randomElement(['preventivo', 'correctivo']),
            'status' => $this->faker->randomElement(['pendiente', 'en_progreso', 'completada', 'cancelada']),
            'priority' => $this->faker->randomElement(['baja', 'media', 'alta', 'critica']),
            'title' => $this->faker->sentence(4),
            'description' => $this->faker->paragraph(),
            'mechanic' => $this->faker->optional()->name(),
            'scheduled_date' => $this->faker->optional()->dateTimeBetween('-1 month', '+1 month'),
            'completion_date' => $this->faker->optional()->dateTimeBetween('-1 week', '+2 weeks'),
            'estimated_cost' => $this->faker->optional()->randomFloat(2, 100, 5000),
            'actual_cost' => $this->faker->optional()->randomFloat(2, 100, 5000),
            'notes' => $this->faker->optional()->sentence(),
            'tasks' => $this->faker->optional()->randomElements([
                'Diagnóstico inicial',
                'Cambio de aceite',
                'Reemplazo de filtro',
                'Revisión de frenos',
            ], $this->faker->numberBetween(1, 3)),
            'parts' => $this->faker->optional()->randomElements([
                ['part' => 'Pastillas de freno', 'quantity' => 2],
                ['part' => 'Filtro de aceite', 'quantity' => 1],
            ], $this->faker->numberBetween(1, 2)),
            'metadata' => ['source' => 'factory'],
        ];
    }
}
