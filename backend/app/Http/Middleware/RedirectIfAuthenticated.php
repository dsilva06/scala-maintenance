<?php

namespace App\Http\Middleware;

use App\Providers\RouteServiceProvider;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  array<int, string>  $guards
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = count($guards) ? $guards : [null];

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                return $request->expectsJson()
                    ? abort(409, 'Already authenticated.')
                    : redirect()->intended(RouteServiceProvider::HOME);
            }
        }

        return $next($request);
    }
}
