<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\Otp;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Tests\TestCase;

class OtpTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_request_otp(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);

        $response = $this->postJson('/api/auth/request-otp', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'OTP sent successfully to your account (Check logs).']);

        $this->assertDatabaseHas('otps', [
            'user_id' => $user->id,
            'used_at' => null,
        ]);
    }

    public function test_user_cannot_request_otp_if_not_registered(): void
    {
        $response = $this->postJson('/api/auth/request-otp', [
            'email' => 'unknown@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
            
        $this->assertEquals('You are not registered.', $response->json('errors.email.0'));
    }

    public function test_user_can_verify_otp_and_login(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);
        
        // Manual OTP creation for testing
        $otpCode = '123456';
        $user->otps()->create([
            'otp_hash' => Hash::make($otpCode),
            'expires_at' => Carbon::now()->addMinutes(5),
        ]);

        $response = $this->postJson('/api/auth/verify-otp', [
            'email' => 'test@example.com',
            'otp' => $otpCode,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'access_token',
                'user' => ['id', 'email']
            ]);

        $this->assertNotNull($user->otps()->whereNotNull('used_at')->first());
    }

    public function test_otp_expires_after_5_minutes(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);
        $otpCode = '123456';
        
        $user->otps()->create([
            'otp_hash' => Hash::make($otpCode),
            'expires_at' => Carbon::now()->subMinutes(6), // Already expired
        ]);

        $response = $this->postJson('/api/auth/verify-otp', [
            'email' => 'test@example.com',
            'otp' => $otpCode,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['otp']);
    }

    public function test_otp_cannot_be_used_twice(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);
        $otpCode = '123456';
        
        $user->otps()->create([
            'otp_hash' => Hash::make($otpCode),
            'expires_at' => Carbon::now()->addMinutes(5),
            'used_at' => Carbon::now()->subMinute(), // Already used
        ]);

        $response = $this->postJson('/api/auth/verify-otp', [
            'email' => 'test@example.com',
            'otp' => $otpCode,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['otp']);
    }

    public function test_otp_max_attempts_security(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);
        $otpCode = '123456';
        
        $user->otps()->create([
            'otp_hash' => Hash::make($otpCode),
            'expires_at' => Carbon::now()->addMinutes(5),
            'attempts' => 5, // Maxed out
        ]);

        $response = $this->postJson('/api/auth/verify-otp', [
            'email' => 'test@example.com',
            'otp' => $otpCode,
        ]);

        $response->assertStatus(422)
            ->assertJsonFragment(['Too many failed attempts. Please request a new OTP.']);
    }
}
