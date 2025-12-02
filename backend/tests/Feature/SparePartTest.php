<?php

namespace Tests\Feature;

use App\Models\SparePart;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SparePartTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_spare_parts(): void
    {
        $this->getJson('/api/spare-parts')->assertUnauthorized();
        $this->postJson('/api/spare-parts', [])->assertUnauthorized();
    }

    public function test_user_lists_only_their_spare_parts(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        SparePart::factory()->count(3)->for($user)->create();
        SparePart::factory()->for($other)->create(['sku' => 'OTHER-001']);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/spare-parts');
        $response->assertOk();
        $response->assertJsonCount(3, 'data');
    }

    public function test_user_can_create_spare_part(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $payload = [
            'sku' => 'SP-0001',
            'name' => 'Filtro de aceite',
            'category' => 'motor',
            'current_stock' => 5,
            'minimum_stock' => 2,
        ];

        $response = $this->postJson('/api/spare-parts', $payload);
        $response->assertCreated();

        $this->assertDatabaseHas('spare_parts', [
            'user_id' => $user->id,
            'sku' => 'SP-0001',
            'name' => 'Filtro de aceite',
        ]);
    }

    public function test_user_can_update_spare_part(): void
    {
        $user = User::factory()->create();
        $part = SparePart::factory()->for($user)->create([
            'sku' => 'SP-1000',
            'current_stock' => 3,
        ]);

        Sanctum::actingAs($user);

        $this->patchJson("/api/spare-parts/{$part->id}", [
            'current_stock' => 10,
            'status' => 'reservado',
        ])->assertOk();

        $this->assertDatabaseHas('spare_parts', [
            'id' => $part->id,
            'current_stock' => 10,
            'status' => 'reservado',
        ]);
    }

    public function test_user_can_delete_spare_part(): void
    {
        $user = User::factory()->create();
        $part = SparePart::factory()->for($user)->create();

        Sanctum::actingAs($user);

        $this->deleteJson("/api/spare-parts/{$part->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('spare_parts', ['id' => $part->id]);
    }

    public function test_user_cannot_access_other_users_part(): void
    {
        $part = SparePart::factory()->create();
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $this->getJson("/api/spare-parts/{$part->id}")
            ->assertForbidden();
    }
}
