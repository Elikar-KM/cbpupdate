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
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->nullable()->constrained('notification_campaigns')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['email', 'web', 'sms', 'push'])->default('web');
            $table->string('subject')->nullable();
            $table->text('content');
            $table->enum('status', ['pending', 'sent', 'failed', 'read', 'clicked'])->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('clicked_at')->nullable();
            $table->json('metadata')->nullable(); // Informations supplémentaires (erreur, tracking, etc.)
            $table->timestamps();
            
            // Index pour performance
            $table->index(['user_id', 'status']);
            $table->index(['campaign_id', 'status']);
            $table->index('sent_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};
