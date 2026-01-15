<?php

namespace Tests\Unit;

use App\Http\Resources\TripResource;
use App\Models\GpsPosition;
use App\Models\Trip;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class TripResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_trip_resource_includes_current_position_and_history(): void
    {
        $user = User::factory()->create();
        $vehicle = Vehicle::factory()->for($user)->create([
            'company_id' => $user->company_id,
        ]);
        $trip = Trip::factory()->for($user)->create([
            'company_id' => $user->company_id,
            'vehicle_id' => $vehicle->id,
        ]);

        $older = GpsPosition::create([
            'company_id' => $user->company_id,
            'user_id' => $user->id,
            'vehicle_id' => $vehicle->id,
            'trip_id' => $trip->id,
            'latitude' => 4.71,
            'longitude' => -74.07,
            'recorded_at' => now()->subMinutes(10),
        ]);
        $newer = GpsPosition::create([
            'company_id' => $user->company_id,
            'user_id' => $user->id,
            'vehicle_id' => $vehicle->id,
            'trip_id' => $trip->id,
            'latitude' => 4.72,
            'longitude' => -74.06,
            'recorded_at' => now()->subMinutes(2),
        ]);

        $trip->load(['latestPosition', 'positions']);

        $resource = TripResource::make($trip)->toArray(Request::create('/'));

        $this->assertArrayHasKey('current_position', $resource);
        $this->assertSame($newer->id, $resource['current_position']['id']);
        $this->assertCount(2, $resource['position_history']);
        $this->assertSame($older->id, $resource['position_history'][0]['id']);
    }
}
