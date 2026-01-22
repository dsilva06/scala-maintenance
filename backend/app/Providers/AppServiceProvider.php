<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
// AI agent services are disabled for this release; keep for later integration.
// use App\Services\AiAgent\AiActionService;
// use App\Services\AiAgent\AiMemoryService;
use App\Services\Mcp\McpContextBuilder;
use App\Services\Mcp\McpRegistry;
use App\Services\Mcp\McpServer;
use App\Services\Mcp\McpToolFormatter;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(McpContextBuilder::class, function () {
            return new McpContextBuilder(config('mcp.context_providers', []));
        });

        $this->app->singleton(McpRegistry::class, function () {
            return new McpRegistry(config('mcp.tools', []));
        });

        $this->app->singleton(McpServer::class, function ($app) {
            return new McpServer($app->make(McpRegistry::class));
        });

        $this->app->singleton(McpToolFormatter::class, function () {
            return new McpToolFormatter();
        });

        // AI agent services disabled for this release.
        // $this->app->singleton(AiActionService::class, function ($app) {
        //     return new AiActionService(
        //         $app->make(McpRegistry::class),
        //         $app->make(AiMemoryService::class)
        //     );
        // });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            $key = $request->user()?->id ?: $request->ip();

            return Limit::perMinute(120)->by((string) $key);
        });

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(20)->by($request->ip());
        });

        RateLimiter::for('ai', function (Request $request) {
            $key = $request->user()?->id ?: $request->ip();

            return Limit::perMinute(30)->by('ai:' . $key);
        });

        RateLimiter::for('mcp', function (Request $request) {
            $key = $request->user()?->id ?: $request->ip();

            return Limit::perMinute(60)->by('mcp:' . $key);
        });

        RateLimiter::for('telemetry', function (Request $request) {
            $key = $request->user()?->id ?: $request->ip();

            return Limit::perMinute(240)->by('telemetry:' . $key);
        });

        RateLimiter::for('analytics', function (Request $request) {
            $key = $request->user()?->id ?: $request->ip();

            return Limit::perMinute(120)->by('analytics:' . $key);
        });

        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url')."/password-reset/$token?email={$notifiable->getEmailForPasswordReset()}";
        });
    }
}
