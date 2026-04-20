<?php

namespace App\Services;

use App\Models\File as FileModel;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FileEncryptionService
{
    protected const CHUNK_SIZE = 64 * 1024; // 64KB
    protected const CIPHER = 'AES-256-CTR';

    /**
     * Encrypt and store a file in chunks using AES-256-CTR.
     *
     * @param UploadedFile $file
     * @return array
     */
    public function encrypt(UploadedFile $file): array
    {
        $key = random_bytes(32);
        // CTR needs 16 bytes IV
        $iv = random_bytes(16);
        
        $storedName = Str::uuid() . '.enc';
        $path = 'files/' . $storedName;
        
        $inputStream = fopen($file->getRealPath(), 'rb');
        
        // Ensure directory exists
        Storage::disk('local')->makeDirectory('files');
        $physicalPath = storage_path('app/private/' . $path);
        
        // We'll use low-level file access for chunked writing to ensures encryption stays in memory
        if (!file_exists(dirname($physicalPath))) {
            mkdir(dirname($physicalPath), 0755, true);
        }
        
        $outputStream = fopen($physicalPath, 'wb');

        // Store IV at the beginning of the file (16 bytes)
        fwrite($outputStream, $iv);

        // For CTR mode, openssl_encrypt handles the counter internally if we encrypt the whole stream,
        // but for chunked encryption, we need to manage the offset or just rely on the fact that
        // CTR is basically XORing with a keystream.
        // The easiest way for chunked CTR in PHP is to use the stream filters or just encrypt chunk by chunk
        // but we must be careful with the IV/counter state.
        
        // Actually, openssl_encrypt in CTR mode doesn't update the IV passed by reference.
        // We'll use a simpler approach for this task: Encrypting in chunks is fine if the IV is handled.
        // For CTR, the keystream depends on the block index.
        
        $ivCopy = $iv;
        while (!feof($inputStream)) {
            $chunk = fread($inputStream, self::CHUNK_SIZE);
            if ($chunk === false || $chunk === '') break;
            
            $encryptedChunk = openssl_encrypt($chunk, self::CIPHER, $key, OPENSSL_RAW_DATA, $ivCopy);
            fwrite($outputStream, $encryptedChunk);
            
            // In CTR mode, the IV for the next chunk must be the "counter" value for the next block.
            // Since CHUNK_SIZE is a multiple of 16 (block size), we can manually increment it.
            $ivCopy = $this->incrementIv($ivCopy, strlen($chunk) / 16);
        }

        fclose($inputStream);
        fclose($outputStream);

        return [
            'key' => $key,
            'path' => $path,
            'name' => $storedName
        ];
    }

    /**
     * Stream and decrypt the file.
     *
     * @param FileModel $file
     * @return StreamedResponse
     */
    public function streamDecrypt(FileModel $file): StreamedResponse
    {
        $physicalPath = storage_path('app/private/' . $file->file_path);
        $key = $file->encryption_key;

        return response()->stream(function () use ($physicalPath, $key) {
            $stream = fopen($physicalPath, 'rb');
            
            // Read IV from the beginning
            $iv = fread($stream, 16);
            $ivCopy = $iv;

            while (!feof($stream)) {
                $chunk = fread($stream, self::CHUNK_SIZE);
                if ($chunk === false || $chunk === '') break;

                $decryptedChunk = openssl_decrypt($chunk, self::CIPHER, $key, OPENSSL_RAW_DATA, $ivCopy);
                echo $decryptedChunk;
                
                $ivCopy = $this->incrementIv($ivCopy, strlen($chunk) / 16);
            }
            
            fclose($stream);
        }, 200, [
            'Content-Type' => $file->mime_type,
            'Content-Disposition' => 'attachment; filename="' . $file->file_name . '"',
        ]);
    }

    /**
     * Increment IV for CTR mode.
     */
    protected function incrementIv(string $iv, int $blockCount): string
    {
        // Simple big-endian increment for the 16-byte IV
        for ($i = 15; $i >= 0 && $blockCount > 0; $i--) {
            $add = $blockCount + ord($iv[$i]);
            $iv[$i] = chr($add % 256);
            $blockCount = floor($add / 256);
        }
        return $iv;
    }
}
