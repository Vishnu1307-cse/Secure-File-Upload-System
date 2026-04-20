<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    protected $fillable = [
        'user_id',
        'file_name',
        'stored_name',
        'mime_type',
        'size',
        'file_path',
        'encryption_key',
        'share_token',
        'download_count',
    ];

    protected $casts = [
        'encryption_key' => 'encrypted',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted()
    {
        static::creating(function ($file) {
            $file->share_token = (string) \Illuminate\Support\Str::uuid();
        });
    }

    /**
     * Get the user that owns the file.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
