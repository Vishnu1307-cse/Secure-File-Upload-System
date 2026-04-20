<?php

namespace Tests\Feature\Security;

use App\Models\User;
use App\Models\File;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FileEncryptionTest extends TestCase
{
    use RefreshDatabase;

    public function test_uploaded_file_is_encrypted_on_disk(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $plainContent = 'This is a very secret content that should not be visible in plain text on the disk.';
        $file = UploadedFile::fake()->createWithContent('secret.txt', $plainContent);

        $response = $this->postJson('/api/files', [
            'file' => $file
        ]);

        $response->assertStatus(201);
        $fileData = $response->json('data');
        
        $storedFile = File::find($fileData['id']);
        $physicalPath = storage_path('app/private/' . $storedFile->file_path);
        
        $this->assertTrue(file_exists($physicalPath));
        
        $encryptedContent = file_get_contents($physicalPath);
        
        // The plain content should NOT be present in the encrypted file
        $this->assertStringNotContainsString('very secret content', $encryptedContent);
        
        // The file size on disk should be slightly larger than original (16 bytes IV at start)
        $this->assertGreaterThan(strlen($plainContent), filesize($physicalPath));
    }

    public function test_file_can_be_decrypted_correctly_on_download(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $plainContent = 'Hello World! Encrypted content test.';
        $file = UploadedFile::fake()->createWithContent('hello.txt', $plainContent);

        // Upload
        $response = $this->postJson('/api/files', ['file' => $file]);
        $response->assertStatus(201);
        $storedFile = File::first();

        // Download
        $response = $this->get("/api/files/{$storedFile->id}/download");

        $response->assertStatus(200);
        $this->assertEquals($plainContent, $response->streamedContent());
    }

    public function test_encryption_key_is_stored_encrypted_in_db(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $file = UploadedFile::fake()->create('test.txt', 10);
        $response = $this->postJson('/api/files', ['file' => $file]);
        $response->assertStatus(201);
        
        // Get the raw DB value (bypassing the cast)
        $rawKey = \Illuminate\Support\Facades\DB::table('files')->first()->encryption_key;
        
        // It should be encrypted. If it was plain text it would be 32 bytes (raw) or 44 bytes (base64).
        // Encrypted cast adds quite a bit of overhead (IV, MAC, etc).
        $this->assertNotEmpty($rawKey);
        $this->assertNotEquals(32, strlen($rawKey));
        $this->assertStringNotContainsString('this-is-plain', $rawKey);
    }
}
