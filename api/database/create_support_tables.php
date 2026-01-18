<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

// Create tickets table
if (!Schema::hasTable('tickets')) {
    Schema::create('tickets', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id')->nullable();
        $table->string('subject');
        $table->string('status')->default('open'); // open, pending, closed
        $table->string('priority')->default('medium'); // low, medium, high
        $table->string('guest_name')->nullable();
        $table->string('guest_email')->nullable();
        $table->string('guest_phone')->nullable();
        $table->string('access_token')->nullable()->unique();
        $table->timestamps();

        $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    });
    echo "Table tickets created\n";
} else {
    echo "Table tickets already exists\n";
    // Add missing columns if any
    Schema::table('tickets', function (Blueprint $table) {
        if (!Schema::hasColumn('tickets', 'status')) {
            $table->string('status')->default('open');
            echo "Column status added to tickets\n";
        }
        if (!Schema::hasColumn('tickets', 'guest_name')) {
            $table->string('guest_name')->nullable();
            echo "Column guest_name added to tickets\n";
        }
    });
}

// Create support_messages table
if (!Schema::hasTable('support_messages')) {
    Schema::create('support_messages', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('ticket_id');
        $table->unsignedBigInteger('user_id')->nullable();
        $table->text('message');
        $table->boolean('is_staff')->default(false);
        $table->timestamps();

        $table->foreign('ticket_id')->references('id')->on('tickets')->onDelete('cascade');
        $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    });
    echo "Table support_messages created\n";
} else {
    echo "Table support_messages already exists\n";
}

// Mark migrations as completed
$batch = DB::table('migrations')->max('batch') + 1;
$migrations = [
    '2025_11_22_223500_create_tickets_table',
    '2025_11_22_223501_create_support_tickets_table', // Duplicate name in list?
    '2025_11_22_224500_add_guest_fields_to_tickets_table'
];

foreach ($migrations as $migration) {
    if (!DB::table('migrations')->where('migration', $migration)->exists()) {
        DB::table('migrations')->insert([
            'migration' => $migration,
            'batch' => $batch
        ]);
        echo "Marked $migration as completed\n";
    }
}
