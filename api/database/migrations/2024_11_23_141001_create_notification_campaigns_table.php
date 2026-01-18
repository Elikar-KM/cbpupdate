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
        Schema::create('notification_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['email', 'web', 'sms', 'push'])->default('web');
            $table->foreignId('template_id')->nullable()->constrained('notification_templates')->onDelete('set null');
            $table->enum('target_type', ['all', 'role', 'status', 'custom', 'manual'])->default('all');
            $table->json('target_filters')->nullable(); // Critères de ciblage
            $table->timestamp('scheduled_at')->nullable();
            $table->enum('status', ['draft', 'scheduled', 'sending', 'sent', 'cancelled', 'failed'])->default('draft');
            $table->json('stats')->nullable(); // Statistiques d'envoi
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_campaigns');
    }
};
