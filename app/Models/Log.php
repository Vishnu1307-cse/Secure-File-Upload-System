<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'action',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * Immutability Logic: Prevent updates and deletions.
     */
    protected static function booted()
    {
        static::updating(function ($log) {
            return false; // Block updates
        });

        static::deleting(function ($log) {
            return false; // Block deletions
        });
    }

    /**
     * Get the user that owns the log.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
