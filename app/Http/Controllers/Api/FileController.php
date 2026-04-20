<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FileResource;
use App\Models\File as FileModel;
use App\Services\AuditService;
use App\Services\FileEncryptionService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FileController extends Controller
{
    protected $encryptionService;
    protected $auditService;

    public function __construct(FileEncryptionService $encryptionService, AuditService $auditService)
    {
        $this->encryptionService = $encryptionService;
        $this->auditService = $auditService;
    }

    /**
     * Display a listing of the authenticated user's files.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $files = FileModel::where('user_id', $request->user()->id)
            ->latest()
            ->paginate(15);

        return response()->json(FileResource::collection($files)->response()->getData(true));
    }

    /**
     * Upload and encrypt a file.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:102400', // 100MB limit for demo
        ]);

        $uploadedFile = $request->file('file');
        
        // Use encryption service to store the file
        $encryptionData = $this->encryptionService->encrypt($uploadedFile);

        $fileEntry = FileModel::create([
            'user_id' => $request->user()->id,
            'file_name' => $uploadedFile->getClientOriginalName(),
            'stored_name' => $encryptionData['name'],
            'mime_type' => $uploadedFile->getMimeType(),
            'size' => $uploadedFile->getSize(),
            'file_path' => $encryptionData['path'],
            'encryption_key' => $encryptionData['key'],
        ]);

        $this->auditService->log(AuditService::ACTION_FILE_UPLOADED, $request->user()->id, [
            'file_id' => $fileEntry->id,
            'file_name' => $fileEntry->file_name
        ]);

        return response()->json([
            'message' => 'File uploaded and encrypted successfully.',
            'data' => new FileResource($fileEntry)
        ], 201);
    }

    /**
     * Decrypt and stream a file.
     *
     * @param FileModel $file
     * @return StreamedResponse|JsonResponse
     */
    public function download(FileModel $file)
    {
        try {
            // Check manual policy for regular download route
            if (request()->routeIs('files.download')) {
                Gate::authorize('view', $file);
            }
            
            // Signed route validation is handled by 'signed' middleware in api.php
            // But we still want to log the download.

        } catch (AuthorizationException $e) {
            $this->auditService->log(AuditService::ACTION_UNAUTHORIZED_ACCESS, auth()->id(), [
                'file_id' => $file->id,
                'intent' => 'download'
            ]);
            throw $e;
        }

        if (!file_exists(storage_path('app/private/' . $file->file_path))) {
            return response()->json(['message' => 'Encrypted file not found on disk.'], 404);
        }

        // Increment download count
        $file->increment('download_count');

        $this->auditService->log(AuditService::ACTION_FILE_DOWNLOADED, auth()->id(), [
            'file_id' => $file->id,
            'file_name' => $file->file_name,
            'is_shared' => request()->routeIs('files.download.shared')
        ]);

        return $this->encryptionService->streamDecrypt($file);
    }

    /**
     * Delete a file.
     *
     * @param FileModel $file
     * @return JsonResponse
     */
    public function destroy(FileModel $file): JsonResponse
    {
        try {
            Gate::authorize('delete', $file);
        } catch (AuthorizationException $e) {
            $this->auditService->log(AuditService::ACTION_UNAUTHORIZED_ACCESS, auth()->id(), [
                'file_id' => $file->id,
                'intent' => 'delete'
            ]);
            throw $e;
        }

        $physicalPath = 'private/' . $file->file_path;
        if (Storage::disk('local')->exists($physicalPath)) {
            Storage::disk('local')->delete($physicalPath);
        }

        $file->delete();

        return response()->json(['message' => 'File deleted successfully.']);
    }

    /**
     * Generate a temporary share link (valid for 3 days).
     *
     * @param FileModel $file
     * @return JsonResponse
     */
    public function share(FileModel $file): JsonResponse
    {
        try {
            Gate::authorize('view', $file);
        } catch (AuthorizationException $e) {
            $this->auditService->log(AuditService::ACTION_UNAUTHORIZED_ACCESS, auth()->id(), [
                'file_id' => $file->id,
                'intent' => 'share'
            ]);
            throw $e;
        }

        // Generate a signed URL valid for 3 days (72 hours)
        $url = URL::temporarySignedRoute(
            'files.download.shared',
            now()->addDays(3),
            ['file' => $file->share_token]
        );

        return response()->json([
            'share_link' => $url,
            'expires_at' => now()->addDays(3)->toDateTimeString(),
            'message' => 'Share link generated (Hidden ID, valid for 3 days).'
        ]);
    }

    /**
     * Revoke all shares by regenerating the token.
     *
     * @param FileModel $file
     * @return JsonResponse
     */
    public function revokeShares(FileModel $file): JsonResponse
    {
        try {
            Gate::authorize('update', $file);
        } catch (AuthorizationException $e) {
            $this->auditService->log(AuditService::ACTION_UNAUTHORIZED_ACCESS, auth()->id(), [
                'file_id' => $file->id,
                'intent' => 'revoke'
            ]);
            throw $e;
        }

        // Regenerating the token instantly invalidates all existing signed URLs
        $file->update([
            'share_token' => (string) \Illuminate\Support\Str::uuid()
        ]);

        return response()->json([
            'message' => 'All share links have been revoked.'
        ]);
    }
}
