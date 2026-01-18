<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RealTimeNotification implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $userId;
    public $type;
    public $data;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($userId, $message, $type = 'info', $data = [])
    {
        $this->userId = $userId;
        $this->message = $message;
        $this->type = $type;
        $this->data = $data;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new PrivateChannel('App.Models.User.' . $this->userId);
    }

    public function broadcastAs()
    {
        return 'notification.created';
    }
}
