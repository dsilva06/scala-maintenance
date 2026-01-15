<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\AiActionController;
use App\Http\Controllers\AiConversationController;
use App\Http\Controllers\AnalyticsEventController;
use App\Http\Controllers\AnalyticsMetricsController;
use App\Http\Controllers\InspectionController;
use App\Http\Controllers\MaintenanceOrderController;
use App\Http\Controllers\McpController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\SparePartController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TelemetryController;
use App\Http\Controllers\TripController;
use App\Http\Controllers\VehicleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ✅ PUBLIC – health check
Route::get ('/health', fn () => ['ok' => true]);

// ✅ AUTH — similar structure to Fitzy (auth prefix + me)
Route::prefix('auth')->middleware('throttle:auth')->group(function () {
    Route::post('register', [RegisteredUserController::class, 'store'])->middleware('guest')->name('register');
    Route::post('login', [AuthenticatedSessionController::class, 'store'])->middleware('guest')->name('login');
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])->middleware('guest')->name('password.email');
    Route::post('reset-password', [NewPasswordController::class, 'store'])->middleware('guest')->name('password.store');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', fn (Request $request) => $request->user());
        Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
        Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)->middleware(['signed', 'throttle:6,1'])->name('verification.verify');
        Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])->middleware(['throttle:6,1'])->name('verification.send');
    });
});

//PROTECTED – application API (auth required)
$registerAppRoutes = function () {
    Route::prefix('ai')->middleware('throttle:ai')->group(function () {
        Route::get('context', [AiConversationController::class, 'context']);
        Route::get('conversations', [AiConversationController::class, 'index']);
        Route::post('conversations', [AiConversationController::class, 'store']);
        Route::get('conversations/{conversation}', [AiConversationController::class, 'show']);
        Route::delete('conversations/{conversation}', [AiConversationController::class, 'destroy']);
        Route::post('conversations/{conversation}/messages', [AiConversationController::class, 'storeMessage']);
        Route::get('conversations/{conversation}/actions', [AiActionController::class, 'index']);
        Route::post('actions/{action}/confirm', [AiActionController::class, 'confirm']);
        Route::post('actions/{action}/cancel', [AiActionController::class, 'cancel']);
    });
    Route::prefix('mcp')->middleware('throttle:mcp')->group(function () {
        Route::get('tools', [McpController::class, 'index']);
        Route::post('tools/{tool}', [McpController::class, 'invoke']);
    });
    Route::apiResource('vehicles', VehicleController::class);
    Route::apiResource('maintenance-orders', MaintenanceOrderController::class);
    Route::apiResource('spare-parts', SparePartController::class);
    Route::apiResource('inspections', InspectionController::class);
    Route::apiResource('purchase-orders', PurchaseOrderController::class);
    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('trips', TripController::class);
    Route::prefix('telemetry')->middleware('throttle:telemetry')->group(function () {
        Route::post('ingest', [TelemetryController::class, 'ingest']);
        Route::get('stream', [TelemetryController::class, 'stream']);
    });
    Route::prefix('analytics')->middleware('throttle:analytics')->group(function () {
        Route::post('events', [AnalyticsEventController::class, 'store']);
        Route::get('events/summary', [AnalyticsEventController::class, 'summary']);
        Route::get('metrics', [AnalyticsMetricsController::class, 'index']);
    });
};

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () use ($registerAppRoutes) {
    $registerAppRoutes();
});

Route::middleware(['auth:sanctum', 'throttle:api'])
    ->prefix('v1')
    ->group(function () use ($registerAppRoutes) {
        $registerAppRoutes();
    });
