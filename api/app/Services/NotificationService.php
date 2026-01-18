<?php

namespace App\Services;

use App\Models\User;
use App\Models\NotificationTemplate;
use App\Models\NotificationCampaign;
use App\Models\NotificationLog;
use App\Models\Notification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Get target users based on campaign filters
     */
    public function getTargetUsers(NotificationCampaign $campaign): Collection
    {
        $query = User::query();

        switch ($campaign->target_type) {
            case 'all':
                // All users
                break;

            case 'role':
                // Filter by role
                if (isset($campaign->target_filters['roles'])) {
                    $query->whereIn('role', $campaign->target_filters['roles']);
                }
                break;

            case 'status':
                // Filter by status
                if (isset($campaign->target_filters['status'])) {
                    $query->where('status', $campaign->target_filters['status']);
                }
                break;

            case 'custom':
                // Custom filters
                $filters = $campaign->target_filters ?? [];
                
                if (isset($filters['min_balance'])) {
                    $query->where('balance', '>=', $filters['min_balance']);
                }
                
                if (isset($filters['max_balance'])) {
                    $query->where('balance', '<=', $filters['max_balance']);
                }
                
                if (isset($filters['registered_after'])) {
                    $query->where('created_at', '>=', $filters['registered_after']);
                }
                
                if (isset($filters['registered_before'])) {
                    $query->where('created_at', '<=', $filters['registered_before']);
                }
                break;

            case 'manual':
                // Manual selection
                if (isset($campaign->target_filters['user_ids'])) {
                    $query->whereIn('id', $campaign->target_filters['user_ids']);
                }
                break;
        }

        return $query->get();
    }

    /**
     * Process template with user data
     */
    public function processTemplate(NotificationTemplate $template, User $user): array
    {
        $variables = [
            'user.name' => $user->name ?? $user->fullName,
            'user.email' => $user->email,
            'user.balance' => number_format($user->balance ?? 0, 2) . ' FCFA',
            'user.role' => $user->role,
            'date' => now()->format('d/m/Y'),
            'company.name' => config('app.name', 'CBP'),
        ];

        $subject = $template->subject;
        $content = $template->content;

        foreach ($variables as $key => $value) {
            $placeholder = '{' . $key . '}';
            $subject = str_replace($placeholder, $value, $subject);
            $content = str_replace($placeholder, $value, $content);
        }

        return [
            'subject' => $subject,
            'content' => $content
        ];
    }

    /**
     * Send web notification
     */
    public function sendWebNotification(User $user, string $title, string $message, ?int $campaignId = null): NotificationLog
    {
        // Create notification in existing table
        $notification = Notification::create([
            'user_id' => $user->id,
            'title' => $title,
            'message' => $message,
            'status' => 0, // Unread
        ]);

        // Log the notification
        $log = NotificationLog::create([
            'campaign_id' => $campaignId,
            'user_id' => $user->id,
            'type' => 'web',
            'subject' => $title,
            'content' => $message,
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        return $log;
    }

    /**
     * Send email notification
     */
    public function sendEmail(User $user, string $subject, string $content, ?int $campaignId = null): NotificationLog
    {
        $log = NotificationLog::create([
            'campaign_id' => $campaignId,
            'user_id' => $user->id,
            'type' => 'email',
            'subject' => $subject,
            'content' => $content,
            'status' => 'pending',
        ]);

        try {
            Mail::send([], [], function ($message) use ($user, $subject, $content) {
                $message->to($user->email)
                    ->subject($subject)
                    ->html($content);
            });

            $log->markAsSent();
        } catch (\Exception $e) {
            Log::error('Email sending failed: ' . $e->getMessage());
            $log->markAsFailed($e->getMessage());
        }

        return $log;
    }

    /**
     * Send SMS notification (placeholder for future implementation)
     */
    public function sendSMS(User $user, string $message, ?int $campaignId = null): NotificationLog
    {
        $log = NotificationLog::create([
            'campaign_id' => $campaignId,
            'user_id' => $user->id,
            'type' => 'sms',
            'content' => $message,
            'status' => 'pending',
        ]);

        // TODO: Implement SMS sending via Twilio/Vonage
        $log->markAsFailed('SMS service not configured');

        return $log;
    }

    /**
     * Send campaign to all target users
     */
    public function sendCampaign(NotificationCampaign $campaign): array
    {
        $campaign->update(['status' => 'sending']);

        $users = $this->getTargetUsers($campaign);
        $results = [
            'total' => $users->count(),
            'sent' => 0,
            'failed' => 0,
        ];

        foreach ($users as $user) {
            try {
                $processed = $this->processTemplate($campaign->template, $user);

                switch ($campaign->type) {
                    case 'email':
                        $this->sendEmail($user, $processed['subject'], $processed['content'], $campaign->id);
                        break;

                    case 'web':
                        $this->sendWebNotification($user, $processed['subject'], $processed['content'], $campaign->id);
                        break;

                    case 'sms':
                        $this->sendSMS($user, $processed['content'], $campaign->id);
                        break;
                }

                $results['sent']++;
            } catch (\Exception $e) {
                Log::error('Campaign sending failed for user ' . $user->id . ': ' . $e->getMessage());
                $results['failed']++;
            }
        }

        $campaign->update(['status' => 'sent']);
        $campaign->updateStats();

        return $results;
    }
}
