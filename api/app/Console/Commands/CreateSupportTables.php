<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class CreateSupportTables extends Command
{
    protected $signature = 'support:create-tables';
    protected $description = 'Create support system tables manually';

    public function handle()
    {
        try {
            $this->info('Creating support tables...');

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
                $this->info('✓ Table tickets created');
            } else {
                $this->info('Table tickets already exists');
                // Add missing columns if any
                Schema::table('tickets', function (Blueprint $table) {
                    if (!Schema::hasColumn('tickets', 'status')) {
                        $table->string('status')->default('open');
                        $this->info('✓ Column status added to tickets');
                    }
                    if (!Schema::hasColumn('tickets', 'guest_name')) {
                        $table->string('guest_name')->nullable();
                        $this->info('✓ Column guest_name added to tickets');
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
                $this->info('✓ Table support_messages created');
            } else {
                $this->info('Table support_messages already exists');
            }

            // Mark migrations as completed
            $batch = DB::table('migrations')->max('batch') + 1;
            $migrations = [
                '2025_11_22_223500_create_tickets_table',
                '2025_11_22_223501_create_support_tickets_table',
                '2025_11_22_224500_add_guest_fields_to_tickets_table'
            ];

            foreach ($migrations as $migration) {
                if (!DB::table('migrations')->where('migration', $migration)->exists()) {
                    DB::table('migrations')->insert([
                        'migration' => $migration,
                        'batch' => $batch
                    ]);
                    $this->info("✓ Marked $migration as completed");
                }
            }

            $this->info('');
            $this->info('All support tables created/verified successfully!');

            return 0;
        } catch (\Exception $e) {
            $this->error('Error creating tables: ' . $e->getMessage());

            return 1;
        }
    }
}
