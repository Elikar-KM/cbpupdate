<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'user_id',
        'type',
        'subject',
        'content',
        'status',
        'sent_at',
        'read_at',
        'clicked_at',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
        'sent_at' => 'datetime',
        'read_at' => 'datetime',
        'clicked_at' => 'datetime',
    ];

    /**
     * Get the campaign for this log
     */
    public function campaign(): BelongsTo
    {
        return $this->belongsTo(NotificationCampaign::class);
    }

    /**
     * Get the user for this log
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mark as sent
     */
    public function markAsSent(): void
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now()
        ]);
    }

    /**
     * Mark as read
     */
    public function markAsRead(): void
    {
        if ($this->status === 'sent') {
            $this->update([
                'status' => 'read',
                'read_at' => now()
            ]);
        }
    }

    /**
     * Mark as clicked
     */
    public function markAsClicked(): void
    {
        if (in_array($this->status, ['sent', 'read'])) {
            $this->update([
                'status' => 'clicked',
                'clicked_at' => now()
            ]);
        }
    }

    /**
     * Mark as failed
     */
    public function markAsFailed(string $error): void
    {
        $this->update([
            'status' => 'failed',
            'metadata' => array_merge($this->metadata ?? [], ['error' => $error])
        ]);
    }
}
