<?php

use App\Http\Controllers\MaintenanceOrderController;
use App\Http\Controllers\SparePartController;
use App\Http\Controllers\VehicleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('vehicles', VehicleController::class);
    Route::apiResource('maintenance-orders', MaintenanceOrderController::class);
    Route::apiResource('spare-parts', SparePartController::class);
});

require __DIR__.'/auth.php';
