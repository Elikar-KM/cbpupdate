<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'subject',
        'content',
        'type',
        'variables',
        'is_active',
        'created_by'
    ];

    protected $casts = [
        'variables' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user who created this template
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Process template with variables
     */
    public function process(array $data): string
    {
        $content = $this->content;
        
        foreach ($data as $key => $value) {
            $content = str_replace("{" . $key . "}", $value, $content);
        }
        
        return $content;
    }

    /**
     * Get available variables for this template
     */
    public function getAvailableVariables(): array
    {
        return $this->variables ?? [
            'user.name',
            'user.email',
            'user.balance',
            'date',
            'company.name'
        ];
    }
}
