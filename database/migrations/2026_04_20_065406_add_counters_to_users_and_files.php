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
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('login_count')->default(0)->after('role');
        });

        Schema::table('files', function (Blueprint $table) {
            $table->unsignedBigInteger('download_count')->default(0)->after('size');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('login_count');
        });

        Schema::table('files', function (Blueprint $table) {
            $table->dropColumn('download_count');
        });
    }
};
