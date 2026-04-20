<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\OtpRequest;
use App\Http\Requests\OtpVerifyRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditService;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class AuthController extends Controller
{
    protected $otpService;
    protected $auditService;

    public function __construct(OtpService $otpService, AuditService $auditService)
    {
        $this->otpService = $otpService;
        $this->auditService = $auditService;
    }

    /**
     * Request an OTP for login.
     *
     * @param OtpRequest $request
     * @return JsonResponse
     */
    public function requestOtp(OtpRequest $request): JsonResponse
    {
        try {
            $email = $request->email;

            // Rate limit by email
            if (RateLimiter::tooManyAttempts('otp-request:'.$email, 3)) {
                return response()->json([
                    'message' => 'Too many requests. Please wait a few minutes.'
                ], 429);
            }

            RateLimiter::hit('otp-request:'.$email, 60);

            $user = User::where('email', $email)->first();

            // Service handles generation
            $this->otpService->generateToken($user);
            
            $this->auditService->log(AuditService::ACTION_OTP_REQUESTED, $user->id, ['email' => $email]);

            return response()->json([
                'message' => 'OTP sent successfully to your account (Check logs).'
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("OTP Request Failed: " . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to process OTP request.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify OTP and issue token.
     *
     * @param OtpVerifyRequest $request
     * @return JsonResponse
     */
    public function verifyOtp(OtpVerifyRequest $request): JsonResponse
    {
        $email = $request->email;
        $otp = $request->otp;

        $user = User::where('email', $email)->first();

        try {
            $this->otpService->verifyToken($user, $otp);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->auditService->log(AuditService::ACTION_LOGIN_FAILED, $user->id, [
                'email' => $email,
                'reason' => 'Incorrect OTP or expired'
            ]);
            
            return response()->json([
                'message' => 'Verification failed.',
                'errors' => $e->errors()
            ], 422);
        }

        // Increment login count
        $user->increment('login_count');

        // Create Sanctum token
        $token = $user->createToken('auth-token')->plainTextToken;

        $this->auditService->log(AuditService::ACTION_LOGIN_SUCCESS, $user->id, ['email' => $email]);

        return response()->json([
            'message' => 'Authenticated successfully.',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user)
        ]);
    }
}
