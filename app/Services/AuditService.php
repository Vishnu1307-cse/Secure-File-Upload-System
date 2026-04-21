<?php

namespace App\Services;

use App\Models\Log;
use Illuminate\Support\Facades\Request;

class AuditService
{
    /**
     * Action Constants
     */
    public const ACTION_LOGIN_SUCCESS = 'LOGIN_SUCCESS';
    public const ACTION_LOGIN_FAILED = 'LOGIN_FAILED';
    public const ACTION_OTP_REQUESTED = 'OTP_REQUESTED';
    public const ACTION_FILE_UPLOADED = 'FILE_UPLOADED';
    public const ACTION_FILE_DOWNLOADED = 'FILE_DOWNLOADED';
    public const ACTION_UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS';
    public const ACTION_USER_REGISTERED = 'USER_REGISTERED';
    public const ACTION_USER_MODERATED = 'USER_MODERATED';

    /**
     * Record an audit log entry.
     *
     * @param string $action
     * @param int|null $userId
     * @param array $metadata
     * @return Log
     */
    public function log(string $action, ?int $userId = null, array $metadata = []): Log
    {
        $payload = array_merge([
            'ip' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ], $metadata);

        return Log::create([
            'user_id' => $userId ?? (auth()->check() ? auth()->id() : null),
            'action' => $action,
            'metadata' => $payload,
        ]);
    }
}
