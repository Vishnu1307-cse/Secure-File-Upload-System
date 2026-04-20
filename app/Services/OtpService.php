<?php

namespace App\Services;

use App\Models\Otp;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class OtpService
{
    /**
     * Generate a new OTP for the user.
     *
     * @param User $user
     * @return string
     */
    public function generateToken(User $user): string
    {
        // 6-digit random number
        $otp = (string) rand(100000, 999999);

        // Store hashed OTP
        $user->otps()->create([
            'otp_hash' => Hash::make($otp),
            'expires_at' => Carbon::now()->addMinutes(5),
            'attempts' => 0,
        ]);

        // Log OTP for development as requested
        $this->logOtp($user->email, $otp);

        return $otp;
    }

    /**
     * Verify the OTP for the user.
     *
     * @param User $user
     * @param string $otp
     * @return bool
     * @throws ValidationException
     */
    public function verifyToken(User $user, string $otp): bool
    {
        $latestOtp = $user->otps()
            ->whereNull('used_at')
            ->where('expires_at', '>', Carbon::now())
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$latestOtp) {
            throw ValidationException::withMessages([
                'otp' => ['Invalid or expired OTP.'],
            ]);
        }

        if ($latestOtp->attempts >= 5) {
            throw ValidationException::withMessages([
                'otp' => ['Too many failed attempts. Please request a new OTP.'],
            ]);
        }

        if (!Hash::check($otp, $latestOtp->otp_hash)) {
            $latestOtp->increment('attempts');
            throw ValidationException::withMessages([
                'otp' => ['Incorrect OTP.'],
            ]);
        }

        // Mark as used
        $latestOtp->update(['used_at' => Carbon::now()]);

        return true;
    }

    /**
     * Log the OTP for debugging/temporary purposes.
     *
     * @param string $email
     * @param string $otp
     */
    protected function logOtp(string $email, string $otp): void
    {
        Log::info("OTP for {$email}: {$otp}");
        // Also print to console if running in dev mode/server
        if (app()->runningInConsole()) {
            echo "\n[DEBUG] OTP for {$email}: {$otp}\n";
        }
    }
}
