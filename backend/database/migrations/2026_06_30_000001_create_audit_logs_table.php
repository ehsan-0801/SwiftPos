<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Audit trail (spec §9): sales, stock changes, and logins are recorded
 * with the acting user and a timestamp.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action')->index();          // e.g. auth.login, sale.created
            $table->string('subject_type')->nullable(); // model class
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->string('description')->nullable();
            $table->json('meta')->nullable();
            $table->timestamp('created_at')->nullable()->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
