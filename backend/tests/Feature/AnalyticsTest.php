<?php

namespace Tests\Feature;

use App\Jobs\IngestAnalyticsEventsJob;
use App\Models\AnalyticsEvent;
use App\Models\MaintenanceOrder;
use App\Models\Trip;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_enqueue_analytics_events(): void
    {
        Bus::fake();

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $payload = [
            'events' => [
                [
                    'name' => 'page.view',
                    'category' => 'navigation',
                    'payload' => ['path' => '/app'],
                ],
            ],
        ];

        $this->postJson('/api/analytics/events', $payload)
            ->assertStatus(202)
            ->assertJsonPath('data.queued', true)
            ->assertJsonPath('data.events', 1);

        Bus::assertDispatched(IngestAnalyticsEventsJob::class);
    }

    public function test_user_can_fetch_event_summary(): void
    {
        $user = User::factory()->admin()->create();
        Sanctum::actingAs($user);

        AnalyticsEvent::create([
            'company_id' => $user->company_id,
            'user_id' => $user->id,
            'event_name' => 'page.view',
            'occurred_at' => now()->subDays(2),
        ]);

        $response = $this->getJson('/api/analytics/events/summary');

        $response->assertOk();
        $response->assertJsonPath('data.total_events', 1);
        $response->assertJsonPath('data.unique_users', 1);
        $response->assertJsonPath('data.events.0.name', 'page.view');
    }

    public function test_metrics_are_computed_for_company(): void
    {
        $user = User::factory()->admin()->create();
        $vehicle = Vehicle::factory()->for($user)->create([
            'company_id' => $user->company_id,
        ]);

        $start = now()->subDays(5);
        $end = now();

        MaintenanceOrder::factory()->for($user)->create([
            'company_id' => $user->company_id,
            'vehicle_id' => $vehicle->id,
            'actual_cost' => 500,
            'scheduled_date' => $start->copy()->addDay(),
            'completion_date' => $start->copy()->addDay()->addHours(4),
        ]);

        Trip::factory()->for($user)->create([
            'company_id' => $user->company_id,
            'vehicle_id' => $vehicle->id,
            'distance_planned' => 200,
            'start_date' => $start->copy()->addDay(),
            'estimated_arrival' => $start->copy()->addDay()->addHours(5),
            'metadata' => [
                'actual_arrival' => $start->copy()->addDay()->addHours(5)->addMinutes(10)->toIso8601String(),
            ],
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/analytics/metrics?start_date=' . $start->toDateString() . '&end_date=' . $end->toDateString());

        $response->assertOk();

        $metrics = $response->json('data.metrics');

        $this->assertSame(2.5, $metrics['cost_per_mile']['value']);
        $this->assertEquals(4.0, $metrics['downtime_hours']['total']);
        $this->assertEquals(10.0, $metrics['eta_accuracy']['average_error_minutes']);
    }
}
