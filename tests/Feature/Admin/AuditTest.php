<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\File;
use App\Models\Log;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuditTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_audit_logs(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        
        Log::create([
            'user_id' => $user->id,
            'action' => 'TEST_ACTION',
            'metadata' => ['info' => 'test']
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/logs');

        $response->assertStatus(200)
            ->assertJsonFragment(['action' => 'TEST_ACTION']);
    }

    public function test_user_activity_is_logged_automatically(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Perform upload
        $file = UploadedFile::fake()->create('document.pdf', 100);
        $this->postJson('/api/files', ['file' => $file]);

        $this->assertDatabaseHas('logs', [
            'user_id' => $user->id,
            'action' => 'FILE_UPLOADED'
        ]);

        // Perform download
        $storedFile = File::first();
        $this->get("/api/files/{$storedFile->id}/download");

        $this->assertDatabaseHas('logs', [
            'user_id' => $user->id,
            'action' => 'FILE_DOWNLOADED'
        ]);
        
        $this->assertEquals(1, $storedFile->fresh()->download_count);
    }

    public function test_logs_are_immutable(): void
    {
        $user = User::factory()->create();
        $log = Log::create([
            'user_id' => $user->id,
            'action' => 'PERMANENT',
            'metadata' => []
        ]);

        // Attempt to update
        $result = $log->update(['action' => 'CHANGED']);
        $this->assertFalse($result);
        $this->assertEquals('PERMANENT', $log->fresh()->action);

        // Attempt to delete
        $result = $log->delete();
        $this->assertFalse($result);
        $this->assertDatabaseHas('logs', ['id' => $log->id]);
    }

    public function test_admin_can_view_statistics(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['login_count' => 10]);
        
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/stats');

        $response->assertStatus(200)
            ->assertJsonPath('performance.total_logins', 10);
    }
}
