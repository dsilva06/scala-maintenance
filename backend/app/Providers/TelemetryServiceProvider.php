<?php

namespace App\Providers;

use App\Services\Telemetry\TelemetryService;
use Illuminate\Support\ServiceProvider;
use OpenTelemetry\SDK\SdkAutoloader;

class TelemetryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(TelemetryService::class, function () {
            return new TelemetryService();
        });
    }

    public function boot(): void
    {
        if (!config('telemetry.enabled')) {
            return;
        }

        if (!getenv('OTEL_SERVICE_NAME')) {
            $serviceName = (string) config('telemetry.service_name');
            if ($serviceName !== '') {
                putenv('OTEL_SERVICE_NAME=' . $serviceName);
                $_ENV['OTEL_SERVICE_NAME'] = $serviceName;
                $_SERVER['OTEL_SERVICE_NAME'] = $serviceName;
            }
        }

        if (class_exists(SdkAutoloader::class)) {
            SdkAutoloader::autoload();
        }
    }
}
