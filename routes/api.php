<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\AuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('auth')->group(function () {
    Route::post('/request-otp', [AuthController::class, 'requestOtp']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/register', [AuthController::class, 'register']);
});

// Role-protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    
    // Admin routes
    Route::middleware(['role:admin'])->prefix('admin')->group(function () {
        Route::get('/users', [AdminController::class, 'indexUsers']);
        Route::get('/pending-users', [AdminController::class, 'indexPendingUsers']);
        Route::post('/users/{user}/approve', [AdminController::class, 'approveUser']);
        Route::post('/users/{user}/ban', [AdminController::class, 'banUser']);
        Route::post('/users/{user}/unban', [AdminController::class, 'unbanUser']);
        Route::get('/logs', [AdminController::class, 'indexLogs']);
        Route::get('/raw-logs', [AdminController::class, 'viewLogs']);
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/all-files', [AdminController::class, 'indexAllFiles']);
        Route::delete('/users/{user}', [AdminController::class, 'destroyUser']);
    });

    // File routes
    Route::prefix('files')->group(function () {
        Route::get('/', [FileController::class, 'index']);
        Route::post('/', [FileController::class, 'store'])->middleware('role:user');
        Route::get('/{file}/download', [FileController::class, 'download'])->name('files.download'); // Policy-guarded
        Route::delete('/{file}', [FileController::class, 'destroy']); // Policy-guarded
        Route::post('/{file}/share', [FileController::class, 'share']); // Policy-guarded
        Route::post('/{file}/revoke-shares', [FileController::class, 'revokeShares']); // Policy-guarded
    });
});

// Public Signed Route for shared downloads
Route::get('/files/{file:share_token}/shared', [FileController::class, 'download'])
    ->name('files.download.shared')
    ->middleware('signed');
