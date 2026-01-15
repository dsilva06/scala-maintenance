<?php

namespace App\Jobs;

use App\Actions\Vehicles\CreateVehicle;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class ImportFleetDataJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(public int $userId, public string $path)
    {
    }

    public function handle(CreateVehicle $createVehicle): void
    {
        $user = User::find($this->userId);

        if (!$user || !Storage::disk('local')->exists($this->path)) {
            return;
        }

        $contents = Storage::disk('local')->get($this->path);
        $payload = json_decode($contents, true);

        if (!is_array($payload)) {
            return;
        }

        foreach ($payload['vehicles'] ?? [] as $vehicle) {
            if (is_array($vehicle)) {
                $createVehicle->handle($user, $vehicle);
            }
        }
    }
}
