<?php

namespace App\Jobs;

use App\Models\Alert;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessAlertJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(public int $alertId)
    {
    }

    public function handle(): void
    {
        $alert = Alert::find($this->alertId);

        if (!$alert) {
            return;
        }

        $metadata = $alert->metadata ?? [];
        $metadata['processed_at'] = now()->toIso8601String();
        $alert->metadata = $metadata;

        if ($alert->status === 'pending') {
            $alert->status = 'processed';
        }

        $alert->save();
    }
}
