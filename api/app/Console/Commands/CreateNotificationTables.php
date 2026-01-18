<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CreateNotificationTables extends Command
{
    protected $signature = 'notification:create-tables';
    protected $description = 'Create notification system tables manually';

    public function handle()
    {
        try {
            $this->info('Creating notification tables...');

            // Create notification_templates table
            DB::statement("
                CREATE TABLE IF NOT EXISTS `notification_templates` (
                  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                  `name` varchar(255) NOT NULL,
                  `subject` varchar(255) DEFAULT NULL,
                  `content` text NOT NULL,
                  `type` enum('email','web','sms','push') NOT NULL DEFAULT 'web',
                  `variables` json DEFAULT NULL,
                  `is_active` tinyint(1) NOT NULL DEFAULT 1,
                  `created_by` bigint(20) UNSIGNED NOT NULL,
                  `created_at` timestamp NULL DEFAULT NULL,
                  `updated_at` timestamp NULL DEFAULT NULL,
                  PRIMARY KEY (`id`),
                  KEY `notification_templates_created_by_foreign` (`created_by`),
                  CONSTRAINT `notification_templates_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");
            $this->info('✓ Table notification_templates created');

            // Create notification_campaigns table
            DB::statement("
                CREATE TABLE IF NOT EXISTS `notification_campaigns` (
                  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                  `name` varchar(255) NOT NULL,
                  `type` enum('email','web','sms','push') NOT NULL DEFAULT 'web',
                  `template_id` bigint(20) UNSIGNED DEFAULT NULL,
                  `target_type` enum('all','role','status','custom','manual') NOT NULL DEFAULT 'all',
                  `target_filters` json DEFAULT NULL,
                  `scheduled_at` timestamp NULL DEFAULT NULL,
                  `status` enum('draft','scheduled','sending','sent','cancelled','failed') NOT NULL DEFAULT 'draft',
                  `stats` json DEFAULT NULL,
                  `created_by` bigint(20) UNSIGNED NOT NULL,
                  `created_at` timestamp NULL DEFAULT NULL,
                  `updated_at` timestamp NULL DEFAULT NULL,
                  PRIMARY KEY (`id`),
                  KEY `notification_campaigns_template_id_foreign` (`template_id`),
                  KEY `notification_campaigns_created_by_foreign` (`created_by`),
                  CONSTRAINT `notification_campaigns_template_id_foreign` FOREIGN KEY (`template_id`) REFERENCES `notification_templates` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `notification_campaigns_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");
            $this->info('✓ Table notification_campaigns created');

            // Create notification_logs table
            DB::statement("
                CREATE TABLE IF NOT EXISTS `notification_logs` (
                  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                  `campaign_id` bigint(20) UNSIGNED DEFAULT NULL,
                  `user_id` bigint(20) UNSIGNED NOT NULL,
                  `type` enum('email','web','sms','push') NOT NULL DEFAULT 'web',
                  `subject` varchar(255) DEFAULT NULL,
                  `content` text NOT NULL,
                  `status` enum('pending','sent','failed','read','clicked') NOT NULL DEFAULT 'pending',
                  `sent_at` timestamp NULL DEFAULT NULL,
                  `read_at` timestamp NULL DEFAULT NULL,
                  `clicked_at` timestamp NULL DEFAULT NULL,
                  `metadata` json DEFAULT NULL,
                  `created_at` timestamp NULL DEFAULT NULL,
                  `updated_at` timestamp NULL DEFAULT NULL,
                  PRIMARY KEY (`id`),
                  KEY `notification_logs_campaign_id_foreign` (`campaign_id`),
                  KEY `notification_logs_user_id_foreign` (`user_id`),
                  KEY `notification_logs_user_id_status_index` (`user_id`,`status`),
                  KEY `notification_logs_campaign_id_status_index` (`campaign_id`,`status`),
                  KEY `notification_logs_sent_at_index` (`sent_at`),
                  CONSTRAINT `notification_logs_campaign_id_foreign` FOREIGN KEY (`campaign_id`) REFERENCES `notification_campaigns` (`id`) ON DELETE CASCADE,
                  CONSTRAINT `notification_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");
            $this->info('✓ Table notification_logs created');

            // Insert into migrations table
            $batch = DB::table('migrations')->max('batch') + 1;
            DB::table('migrations')->insert([
                ['migration' => '2024_11_23_141000_create_notification_templates_table', 'batch' => $batch],
                ['migration' => '2024_11_23_141001_create_notification_campaigns_table', 'batch' => $batch],
                ['migration' => '2024_11_23_141002_create_notification_logs_table', 'batch' => $batch],
            ]);
            $this->info('✓ Migrations marked as completed');

            $this->info('');
            $this->info('All notification tables created successfully!');

            return 0;
        } catch (\Exception $e) {
            $this->error('Error creating tables: ' . $e->getMessage());

            return 1;
        }
    }
}
