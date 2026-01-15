<?php

return [
    'enabled' => env('ANALYTICS_ENABLED', true),
    'max_events' => env('ANALYTICS_MAX_EVENTS', 100),
    'retention_days' => env('ANALYTICS_RETENTION_DAYS', 90),
    'default_range_days' => env('ANALYTICS_DEFAULT_RANGE_DAYS', 30),
];
