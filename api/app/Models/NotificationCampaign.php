<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NotificationCampaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'template_id',
        'target_type',
        'target_filters',
        'scheduled_at',
        'status',
        'stats',
        'created_by'
    ];

    protected $casts = [
        'target_filters' => 'array',
        'stats' => 'array',
        'scheduled_at' => 'datetime',
    ];

    /**
     * Get the template for this campaign
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(NotificationTemplate::class);
    }

    /**
     * Get the user who created this campaign
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all logs for this campaign
     */
    public function logs(): HasMany
    {
        return $this->hasMany(NotificationLog::class, 'campaign_id');
    }

    /**
     * Update campaign statistics
     */
    public function updateStats(): void
    {
        $stats = [
            'total' => $this->logs()->count(),
            'sent' => $this->logs()->where('status', 'sent')->count(),
            'failed' => $this->logs()->where('status', 'failed')->count(),
            'read' => $this->logs()->where('status', 'read')->count(),
            'clicked' => $this->logs()->where('status', 'clicked')->count(),
        ];

        $stats['delivery_rate'] = $stats['total'] > 0 ? ($stats['sent'] / $stats['total']) * 100 : 0;
        $stats['open_rate'] = $stats['sent'] > 0 ? ($stats['read'] / $stats['sent']) * 100 : 0;
        $stats['click_rate'] = $stats['read'] > 0 ? ($stats['clicked'] / $stats['read']) * 100 : 0;

        $this->update(['stats' => $stats]);
    }

    /**
     * Check if campaign is scheduled
     */
    public function isScheduled(): bool
    {
        return $this->status === 'scheduled' && $this->scheduled_at !== null;
    }

    /**
     * Check if campaign can be sent
     */
    public function canBeSent(): bool
    {
        return in_array($this->status, ['draft', 'scheduled']);
    }
}
