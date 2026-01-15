<?php

namespace Tests\Feature;

use App\Jobs\IngestTelemetryBatchJob;
use App\Models\Trip;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TelemetryTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_queue_telemetry_for_vehicle(): void
    {
        Bus::fake();

        $user = User::factory()->create();
        $vehicle = Vehicle::factory()->for($user)->create([
            'company_id' => $user->company_id,
        ]);

        Sanctum::actingAs($user);

        $payload = [
            'vehicle_id' => $vehicle->id,
            'points' => [
                [
                    'lat' => 4.710989,
                    'lng' => -74.072092,
                    'speed_kph' => 72.5,
                ],
            ],
        ];

        $this->postJson('/api/telemetry/ingest', $payload)
            ->assertStatus(202)
            ->assertJsonPath('data.queued', true)
            ->assertJsonPath('data.points', 1);

        Bus::assertDispatched(IngestTelemetryBatchJob::class, function (IngestTelemetryBatchJob $job) use ($user, $vehicle) {
            return $job->companyId === $user->company_id
                && $job->userId === $user->id
                && $job->vehicleId === $vehicle->id
                && $job->tripId === null
                && $job->points !== [];
        });
    }

    public function test_user_can_queue_telemetry_for_trip_and_resolves_vehicle(): void
    {
        Bus::fake();

        $user = User::factory()->create();
        $vehicle = Vehicle::factory()->for($user)->create([
            'company_id' => $user->company_id,
        ]);
        $trip = Trip::factory()->for($user)->create([
            'company_id' => $user->company_id,
            'vehicle_id' => $vehicle->id,
        ]);

        Sanctum::actingAs($user);

        $payload = [
            'trip_id' => $trip->id,
            'points' => [
                [
                    'lat' => 4.702,
                    'lng' => -74.091,
                    'recorded_at' => now()->subMinutes(5)->toIso8601String(),
                ],
            ],
        ];

        $this->postJson('/api/telemetry/ingest', $payload)
            ->assertStatus(202);

        Bus::assertDispatched(IngestTelemetryBatchJob::class, function (IngestTelemetryBatchJob $job) use ($user, $vehicle, $trip) {
            return $job->companyId === $user->company_id
                && $job->userId === $user->id
                && $job->vehicleId === $vehicle->id
                && $job->tripId === $trip->id;
        });
    }

    public function test_vehicle_or_trip_is_required(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $payload = [
            'points' => [
                [
                    'lat' => 4.71,
                    'lng' => -74.07,
                ],
            ],
        ];

        $this->postJson('/api/telemetry/ingest', $payload)
            ->assertStatus(422);
    }

    public function test_user_cannot_ingest_for_other_company_trip(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $trip = Trip::factory()->for($otherUser)->create([
            'company_id' => $otherUser->company_id,
        ]);

        Sanctum::actingAs($user);

        $payload = [
            'trip_id' => $trip->id,
            'points' => [
                [
                    'lat' => 4.7,
                    'lng' => -74.1,
                ],
            ],
        ];

        $this->postJson('/api/telemetry/ingest', $payload)
            ->assertStatus(422);
    }
}
