<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;
use App\Services\AiAgent\AiActionService;
use App\Services\AiAgent\AiMemoryService;
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

        $this->app->singleton(AiActionService::class, function ($app) {
            return new AiActionService(
                $app->make(McpRegistry::class),
                $app->make(AiMemoryService::class)
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url')."/password-reset/$token?email={$notifiable->getEmailForPasswordReset()}";
        });
    }
}
