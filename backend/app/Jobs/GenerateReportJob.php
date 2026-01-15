<?php

namespace App\Jobs;

use App\Models\Alert;
use App\Models\MaintenanceOrder;
use App\Models\Trip;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GenerateReportJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(public int $userId, public string $type = 'fleet-summary')
    {
    }

    public function handle(): void
    {
        $user = User::find($this->userId);

        if (!$user) {
            return;
        }

        $payload = [
            'type' => $this->type,
            'generated_at' => now()->toIso8601String(),
            'counts' => [
                'vehicles' => Vehicle::where('company_id', $user->company_id)->count(),
                'trips' => Trip::where('company_id', $user->company_id)->count(),
                'maintenance_orders' => MaintenanceOrder::where('company_id', $user->company_id)->count(),
                'alerts' => Alert::where('company_id', $user->company_id)->count(),
            ],
        ];

        $disk = config('fleet.report_storage_disk', 'local');
        $directory = 'reports/' . $user->id;
        $filename = Str::slug($this->type) . '-' . now()->format('YmdHis') . '.json';
        $path = $directory . '/' . $filename;

        Storage::disk($disk)->put($path, json_encode($payload, JSON_PRETTY_PRINT));
    }
}
