<?php

return [
    'eta_default_speed_kmh' => env('FLEET_ETA_SPEED_KMH', 60),
    'report_storage_disk' => env('FLEET_REPORT_STORAGE_DISK', 'local'),
    'telemetry' => [
        'max_points' => env('FLEET_TELEMETRY_MAX_POINTS', 200),
        'position_history_limit' => env('FLEET_POSITION_HISTORY_LIMIT', 50),
        'stream_sleep_ms' => env('FLEET_TELEMETRY_STREAM_SLEEP_MS', 1000),
        'stream_timeout_seconds' => env('FLEET_TELEMETRY_STREAM_TIMEOUT_SECONDS', 20),
    ],
];
