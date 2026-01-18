-- Manual SQL script to create notification system tables
-- Run this directly in your database if migrations fail

-- Table: notification_templates
CREATE TABLE IF NOT EXISTS `notification_templates` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `content` text NOT NULL,
  `type` enum('email','web','sms','push') NOT NULL DEFAULT 'web',
  `variables` json DEFAULT NULL COMMENT 'Variables disponibles dans le template',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notification_templates_created_by_foreign` (`created_by`),
  CONSTRAINT `notification_templates_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: notification_campaigns
CREATE TABLE IF NOT EXISTS `notification_campaigns` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('email','web','sms','push') NOT NULL DEFAULT 'web',
  `template_id` bigint(20) UNSIGNED DEFAULT NULL,
  `target_type` enum('all','role','status','custom','manual') NOT NULL DEFAULT 'all',
  `target_filters` json DEFAULT NULL COMMENT 'Critères de ciblage',
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `status` enum('draft','scheduled','sending','sent','cancelled','failed') NOT NULL DEFAULT 'draft',
  `stats` json DEFAULT NULL COMMENT 'Statistiques d\'envoi',
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notification_campaigns_template_id_foreign` (`template_id`),
  KEY `notification_campaigns_created_by_foreign` (`created_by`),
  CONSTRAINT `notification_campaigns_template_id_foreign` FOREIGN KEY (`template_id`) REFERENCES `notification_templates` (`id`) ON DELETE SET NULL,
  CONSTRAINT `notification_campaigns_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: notification_logs
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
  `metadata` json DEFAULT NULL COMMENT 'Informations supplémentaires',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert into migrations table to mark as migrated
INSERT INTO `migrations` (`migration`, `batch`) VALUES
('2024_11_23_141000_create_notification_templates_table', (SELECT COALESCE(MAX(batch), 0) + 1 FROM (SELECT batch FROM migrations) AS temp)),
('2024_11_23_141001_create_notification_campaigns_table', (SELECT COALESCE(MAX(batch), 0) + 1 FROM (SELECT batch FROM migrations) AS temp)),
('2024_11_23_141002_create_notification_logs_table', (SELECT COALESCE(MAX(batch), 0) + 1 FROM (SELECT batch FROM migrations) AS temp));
