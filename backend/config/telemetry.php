<?php

return [
    'enabled' => env('OTEL_ENABLED', false),
    'service_name' => env('OTEL_SERVICE_NAME', env('APP_NAME', 'laravel')),
];
