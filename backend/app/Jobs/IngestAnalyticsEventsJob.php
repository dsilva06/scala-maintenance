<?php

namespace App\Jobs;

use App\Models\AnalyticsEvent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class IngestAnalyticsEventsJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    /**
     * @param array<int, array<string, mixed>> $events
     */
    public function __construct(
        public int $companyId,
        public ?int $userId,
        public array $events,
        public ?string $ipAddress,
        public ?string $userAgent
    ) {
    }

    public function handle(): void
    {
        if (!config('analytics.enabled')) {
            return;
        }

        if ($this->events === []) {
            return;
        }

        $now = now();
        $rows = [];

        foreach ($this->events as $event) {
            if (!is_array($event) || empty($event['name'])) {
                continue;
            }

            $rows[] = [
                'company_id' => $this->companyId,
                'user_id' => $this->userId,
                'event_name' => $event['name'],
                'event_category' => $event['category'] ?? null,
                'entity_type' => $event['entity_type'] ?? null,
                'entity_id' => $event['entity_id'] ?? null,
                'occurred_at' => $event['occurred_at'] ?? $now,
                'payload' => isset($event['payload']) ? json_encode($event['payload']) : null,
                'metadata' => isset($event['metadata']) ? json_encode($event['metadata']) : null,
                'source' => $event['source'] ?? null,
                'ip_address' => $this->ipAddress,
                'user_agent' => $this->userAgent ? substr($this->userAgent, 0, 255) : null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if ($rows === []) {
            return;
        }

        AnalyticsEvent::insert($rows);
    }
}
