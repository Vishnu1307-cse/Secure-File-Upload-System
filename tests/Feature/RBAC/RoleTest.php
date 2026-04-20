<?php

namespace Tests\Feature\RBAC;

use App\Models\File;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_user_list(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/users');

        $response->assertStatus(200);
    }

    public function test_user_cannot_access_user_list(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/admin/users');

        $response->assertStatus(403)
            ->assertJson(['message' => 'Unauthorized. You do not have the required role.']);
    }

    public function test_user_can_upload_file(): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/files', [
            'file' => UploadedFile::fake()->create('document.pdf', 500)
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('files', [
            'user_id' => $user->id,
            'file_name' => 'document.pdf'
        ]);
        
        $storedFile = File::first();
        $physicalPath = storage_path('app/private/' . $storedFile->file_path);
        $this->assertTrue(file_exists($physicalPath));
    }

    public function test_admin_can_delete_any_file(): void
    {
        Storage::fake('local');
        $admin = User::factory()->create(['role' => 'admin']);
        $owner = User::factory()->create(['role' => 'user']);
        
        $file = File::create([
            'user_id' => $owner->id,
            'file_name' => 'test.txt',
            'stored_name' => 'uuid.txt',
            'mime_type' => 'text/plain',
            'size' => 10,
            'file_path' => 'files/uuid.txt',
            'encryption_key' => 'fake-key'
        ]);
        Storage::disk('local')->put('private/' . $file->file_path, 'content');

        Sanctum::actingAs($admin);

        $response = $this->deleteJson("/api/files/{$file->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('files', ['id' => $file->id]);
        Storage::disk('local')->assertMissing('private/' . $file->file_path);
    }

    public function test_user_cannot_delete_others_file(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $owner = User::factory()->create(['role' => 'user']);
        
        $file = File::create([
            'user_id' => $owner->id,
            'file_name' => 'test.txt',
            'stored_name' => 'uuid.txt',
            'mime_type' => 'text/plain',
            'size' => 10,
            'file_path' => 'files/uuid.txt',
            'encryption_key' => 'fake-key'
        ]);

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/files/{$file->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('files', ['id' => $file->id]);
    }

    public function test_user_can_generate_share_link(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $file = File::create([
            'user_id' => $user->id,
            'file_name' => 'test.txt',
            'stored_name' => 'uuid.txt',
            'mime_type' => 'text/plain',
            'size' => 10,
            'file_path' => 'files/uuid.txt',
            'encryption_key' => 'fake-key'
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/files/{$file->id}/share");

        $response->assertStatus(200)
            ->assertJsonStructure(['share_link', 'expires_at']);
    }
}
