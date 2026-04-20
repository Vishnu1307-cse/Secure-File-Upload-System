<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        // Admin bypass (Super User) or exact role match
        if (!$user || ($user->role !== 'admin' && $user->role !== $role)) {
            return response()->json([
                'message' => 'Unauthorized. You do not have the required role.'
            ], 403);
        }

        return $next($request);
    }
}
