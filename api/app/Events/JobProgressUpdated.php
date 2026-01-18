<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class JobProgressUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $jobId;
    public $progress;
    public $status;
    public $message;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($jobId, $progress, $status = 'processing', $message = '')
    {
        $this->jobId = $jobId;
        $this->progress = $progress;
        $this->status = $status;
        $this->message = $message;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new Channel('job-progress.' . $this->jobId);
    }

    public function broadcastAs()
    {
        return 'progress.updated';
    }
}
