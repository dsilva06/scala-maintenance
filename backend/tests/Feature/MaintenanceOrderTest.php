<?php

namespace Tests\Feature;

use App\Models\MaintenanceOrder;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MaintenanceOrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_orders(): void
    {
        $this->getJson('/api/maintenance-orders')->assertUnauthorized();
        $this->postJson('/api/maintenance-orders', [])->assertUnauthorized();
    }

    public function test_user_lists_only_their_orders(): void
    {
        $user = User::factory()->create();
        $vehicle = Vehicle::factory()->for($user)->create();
        $otherVehicle = Vehicle::factory()->create();

        MaintenanceOrder::factory()->count(2)->for($user)->for($vehicle)->create();
        MaintenanceOrder::factory()->for($otherVehicle->user)->for($otherVehicle)
            ->create(['order_number' => 'OUT-001']);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/maintenance-orders');
        $response->assertOk();
        $response->assertJsonCount(2, 'data');
    }

    public function test_user_can_create_order(): void
    {
        $user = User::factory()->create();
        $vehicle = Vehicle::factory()->for($user)->create();

        Sanctum::actingAs($user);

        $payload = [
            'vehicle_id' => $vehicle->id,
            'order_number' => 'mnt-2024-001',
            'title' => 'Cambio de aceite',
            'type' => 'preventivo',
            'status' => 'pendiente',
            'priority' => 'media',
        ];

        $response = $this->postJson('/api/maintenance-orders', $payload);

        $response->assertCreated();
        $this->assertDatabaseHas('maintenance_orders', [
            'user_id' => $user->id,
            'vehicle_id' => $vehicle->id,
            'order_number' => 'MNT-2024-001',
            'title' => 'Cambio de aceite',
        ]);
    }

    public function test_user_cannot_use_vehicle_of_another_user(): void
    {
        $user = User::factory()->create();
        $otherVehicle = Vehicle::factory()->create();

        Sanctum::actingAs($user);

        $this->postJson('/api/maintenance-orders', [
            'vehicle_id' => $otherVehicle->id,
            'order_number' => 'MNT-FAIL',
        ])->assertStatus(422);
    }

    public function test_user_can_update_order(): void
    {
        $user = User::factory()->create();
        $vehicle = Vehicle::factory()->for($user)->create();
        $order = MaintenanceOrder::factory()->for($user)->for($vehicle)->create([
            'order_number' => 'MNT-1000',
            'status' => 'pendiente',
        ]);

        Sanctum::actingAs($user);

        $this->patchJson("/api/maintenance-orders/{$order->id}", [
            'status' => 'en_progreso',
            'priority' => 'alta',
        ])->assertOk();

        $this->assertDatabaseHas('maintenance_orders', [
            'id' => $order->id,
            'status' => 'en_progreso',
            'priority' => 'alta',
        ]);
    }

    public function test_user_can_delete_order(): void
    {
        $user = User::factory()->create();
        $vehicle = Vehicle::factory()->for($user)->create();
        $order = MaintenanceOrder::factory()->for($user)->for($vehicle)->create([
            'order_number' => 'MNT-DEL',
        ]);

        Sanctum::actingAs($user);

        $this->deleteJson("/api/maintenance-orders/{$order->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('maintenance_orders', ['id' => $order->id]);
    }

    public function test_user_cannot_view_order_of_another_user(): void
    {
        $owner = User::factory()->create();
        $vehicle = Vehicle::factory()->for($owner)->create();
        $order = MaintenanceOrder::factory()->for($owner)->for($vehicle)->create();
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $this->getJson("/api/maintenance-orders/{$order->id}")
            ->assertForbidden();
    }
}
