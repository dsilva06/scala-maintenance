<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Jobs\GenerateReportJob;
use App\Jobs\ImportFleetDataJob;
use App\Jobs\ProcessAlertJob;
// use App\Jobs\RecomputeTripEtaJob;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('reports:generate {userId} {--type=fleet-summary}', function () {
    $userId = (int) $this->argument('userId');
    $type = (string) $this->option('type');

    GenerateReportJob::dispatch($userId, $type);

    $this->info("Report job queued for user {$userId}.");
})->purpose('Queue a fleet report generation job');

Artisan::command('imports:process {userId} {path}', function () {
    $userId = (int) $this->argument('userId');
    $path = (string) $this->argument('path');

    ImportFleetDataJob::dispatch($userId, $path);

    $this->info("Import job queued for user {$userId}.");
})->purpose('Queue a fleet data import job');

Artisan::command('alerts:process {alertId}', function () {
    $alertId = (int) $this->argument('alertId');

    ProcessAlertJob::dispatch($alertId);

    $this->info("Alert job queued for alert {$alertId}.");
})->purpose('Queue an alert processing job');

// Artisan::command('trips:recompute-eta {tripId}', function () {
//     $tripId = (int) $this->argument('tripId');
//
//     RecomputeTripEtaJob::dispatch($tripId);
//
//     $this->info("ETA recompute job queued for trip {$tripId}.");
// })->purpose('Queue an ETA recomputation job');
