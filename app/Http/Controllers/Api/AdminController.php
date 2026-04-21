<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Http\Resources\FileResource;
use App\Models\File as FileModel;
use App\Models\Log;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use App\Services\AuditService;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminController extends Controller
{
    protected $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    /**
     * Display a listing of all users (Admin only).
     *
     * @return JsonResponse
     */
    public function indexUsers(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->has('search')) {
            $query->where('email', 'like', '%' . $request->search . '%')
                  ->orWhere('name', 'like', '%' . $request->search . '%')
                  ->orWhere('department', 'like', '%' . $request->search . '%');
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $users = $query->latest()->get();
        
        return response()->json([
            'data' => UserResource::collection($users)
        ]);
    }

    /**
     * Display a listing of pending users.
     */
    public function indexPendingUsers(): JsonResponse
    {
        $users = User::where('status', User::STATUS_PENDING)->latest()->get();
        return response()->json([
            'data' => UserResource::collection($users)
        ]);
    }

    /**
     * Approve a pending user.
     */
    public function approveUser(User $user): JsonResponse
    {
        $user->update(['status' => User::STATUS_APPROVED]);
        
        $this->auditService->log(AuditService::ACTION_USER_MODERATED, $user->id, [
            'admin_id' => auth()->id(),
            'action' => 'APPROVE'
        ]);

        return response()->json(['message' => 'User authorization approved.']);
    }

    /**
     * Ban a user.
     */
    public function banUser(User $user): JsonResponse
    {
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'You cannot ban yourself.'], 403);
        }

        $user->update(['status' => User::STATUS_BANNED]);
        
        $this->auditService->log(AuditService::ACTION_USER_MODERATED, $user->id, [
            'admin_id' => auth()->id(),
            'action' => 'BAN'
        ]);

        return response()->json(['message' => 'User access revoked (BANNED).']);
    }

    /**
     * Unban a user.
     */
    public function unbanUser(User $user): JsonResponse
    {
        $user->update(['status' => User::STATUS_APPROVED]);
        
        $this->auditService->log(AuditService::ACTION_USER_MODERATED, $user->id, [
            'admin_id' => auth()->id(),
            'action' => 'UNBAN'
        ]);

        return response()->json(['message' => 'User access restored.']);
    }

    /**
     * Display a paginated listing of system logs.
     *
     * @return JsonResponse
     */
    public function indexLogs(): JsonResponse
    {
        $logs = Log::with('user')->latest()->paginate(50);
        return response()->json($logs);
    }

    /**
     * Display a listing of all files (including deleted ones).
     *
     * @return JsonResponse
     */
    public function indexAllFiles(): JsonResponse
    {
        $files = FileModel::withTrashed()
            ->with('user')
            ->latest()
            ->paginate(50);

        return response()->json(FileResource::collection($files)->response()->getData(true));
    }

    /**
     * Display global system statistics.
     *
     * @return JsonResponse
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'totals' => [
                'users' => User::count(),
                'pending_users' => User::where('status', User::STATUS_PENDING)->count(),
                'files' => FileModel::count(),
                'logs' => Log::count(),
            ],
            'performance' => [
                'total_logins' => (int) User::sum('login_count'),
                'total_downloads' => (int) FileModel::sum('download_count'),
            ],
            'top_downloaded_files' => FileModel::orderBy('download_count', 'desc')
                ->limit(5)
                ->get(['id', 'file_name', 'download_count']),
            'most_active_users' => User::orderBy('login_count', 'desc')
                ->limit(5)
                ->get(['id', 'name', 'email', 'login_count']),
        ]);
    }

    /**
     * View raw logs (Admin only).
     *
     * @return StreamedResponse|JsonResponse
     */
    public function viewLogs(): StreamedResponse|JsonResponse
    {
        $path = storage_path('logs/laravel.log');

        if (!File::exists($path)) {
            return response()->json(['message' => 'Log file not found.'], 404);
        }

        return response()->stream(function () use ($path) {
            $stream = fopen($path, 'r');
            fpassthru($stream);
            fclose($stream);
        }, 200, [
            'Content-Type' => 'text/plain',
        ]);
    }

    /**
     * Delete a user (Admin only).
     *
     * @param User $user
     * @return JsonResponse
     */
    public function destroyUser(User $user): JsonResponse
    {
        // Don't allow admin to delete themselves
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'You cannot delete your own admin account.'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully.']);
    }
}
