<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('files', function (Blueprint $table) {
            $table->renameColumn('original_name', 'file_name');
            $table->renameColumn('path', 'file_path');
            $table->text('encryption_key')->after('size')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('files', function (Blueprint $table) {
            $table->renameColumn('file_name', 'original_name');
            $table->renameColumn('file_path', 'path');
            $table->dropColumn('encryption_key');
        });
    }
};
