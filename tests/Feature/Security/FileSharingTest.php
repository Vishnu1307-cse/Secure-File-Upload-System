<?php

namespace Tests\Feature\Security;

use App\Models\User;
use App\Models\File;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FileSharingTest extends TestCase
{
    use RefreshDatabase;

    public function test_share_link_does_not_contain_file_id(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $file = File::create([
            'user_id' => $user->id,
            'file_name' => 'test.txt',
            'stored_name' => 'uuid.enc',
            'mime_type' => 'text/plain',
            'size' => 10,
            'file_path' => 'files/uuid.enc',
            'encryption_key' => 'fake-key'
        ]);

        $response = $this->postJson("/api/files/{$file->id}/share");

        $response->assertStatus(200);
        $shareUrl = $response->json('share_link');
        
        // Ensure physical file exists for the download part of the logic to pass
        Storage::disk('local')->put($file->file_path, 'encrypted-content');

        // Ensure the numeric ID is NOT in the sharing part of the URL
        $this->assertStringContainsString($file->share_token, $shareUrl);
        $this->assertStringNotContainsString("/files/{$file->id}/shared", $shareUrl);
    }

    public function test_share_link_is_valid_for_3_days(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $file = File::create([
            'user_id' => $user->id,
            'file_name' => 'test.txt',
            'stored_name' => 'uuid.enc',
            'mime_type' => 'text/plain',
            'size' => 10,
            'file_path' => 'files/uuid.enc',
            'encryption_key' => 'fake-key'
        ]);

        $response = $this->postJson("/api/files/{$file->id}/share");
        $shareUrl = $response->json('share_link');
        
        Storage::disk('local')->put($file->file_path, 'encrypted-content');

        // Access valid link
        $this->get($shareUrl)->assertStatus(200);

        // Move time forward 4 days
        $this->travel(4)->days();

        // Should be expired
        $this->get($shareUrl)->assertStatus(403);
    }

    public function test_revoke_invalidates_existing_links(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $file = File::create([
            'user_id' => $user->id,
            'file_name' => 'test.txt',
            'stored_name' => 'uuid.enc',
            'mime_type' => 'text/plain',
            'size' => 10,
            'file_path' => 'files/uuid.enc',
            'encryption_key' => 'fake-key'
        ]);

        $response = $this->postJson("/api/files/{$file->id}/share");
        $shareUrl = $response->json('share_link');
        
        Storage::disk('local')->put($file->file_path, 'encrypted-content');

        // Valid before revoke
        $this->get($shareUrl)->assertStatus(200);

        // Revoke
        $this->postJson("/api/files/{$file->id}/revoke-shares")->assertStatus(200);

        // Should now be 404 (because the share_token in the URL no longer exists in DB)
        $this->get($shareUrl)->assertStatus(404);
    }
}
