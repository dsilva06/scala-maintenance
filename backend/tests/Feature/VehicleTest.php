<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class VehicleTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_vehicle_endpoints(): void
    {
        $this->getJson('/api/vehicles')->assertUnauthorized();
        $this->postJson('/api/vehicles', [])->assertUnauthorized();
    }

    public function test_user_lists_only_their_vehicles(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        Vehicle::factory()->count(2)->for($user)->create();
        Vehicle::factory()->for($otherUser)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/vehicles');

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
    }

    public function test_user_can_create_vehicle(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $payload = [
            'plate' => 'abc-123',
            'brand' => 'Volvo',
            'model' => 'FH',
            'year' => 2020,
            'vehicle_type' => 'carga',
        ];

        $response = $this->postJson('/api/vehicles', $payload);

        $response->assertCreated();
        $this->assertDatabaseHas('vehicles', [
            'user_id' => $user->id,
            'plate' => 'ABC-123',
            'brand' => 'Volvo',
        ]);
    }

    public function test_user_can_update_vehicle(): void
    {
        $user = User::factory()->create();
        $vehicle = Vehicle::factory()->for($user)->create([
            'plate' => 'AAA-111',
            'status' => 'activo',
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/vehicles/{$vehicle->id}", [
            'status' => 'mantenimiento',
            'current_mileage' => 12345,
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('vehicles', [
            'id' => $vehicle->id,
            'status' => 'mantenimiento',
            'current_mileage' => 12345,
        ]);
    }

    public function test_user_can_delete_vehicle(): void
    {
        $user = User::factory()->create();
        $vehicle = Vehicle::factory()->for($user)->create();

        Sanctum::actingAs($user);

        $this->deleteJson("/api/vehicles/{$vehicle->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('vehicles', ['id' => $vehicle->id]);
    }

    public function test_user_cannot_access_someone_elses_vehicle(): void
    {
        $user = User::factory()->create();
        $otherVehicle = Vehicle::factory()->create();

        Sanctum::actingAs($user);

        $this->getJson("/api/vehicles/{$otherVehicle->id}")
            ->assertForbidden();
    }
}
