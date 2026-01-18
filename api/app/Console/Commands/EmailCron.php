<?php

namespace App\Console\Commands;

use App\Models\Notification;
use Illuminate\Console\Command;

class EmailCron extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:cron';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        // Write your database logic we bellow:
        // algo
        
        $count=0;
        
        $notifications = Notification::where(["status" => 1])->get();
        
        foreach ($notifications as $notifKey => $notifObject) {

               \Illuminate\Support\Facades\Mail::send([], [], function (\Illuminate\Mail\Message $message) use ($notifObject) {
                $message
                    ->from('cbp@cbpcommunity.com')
                    ->to($notifObject->email_destination)
                    ->subject($notifObject->object)
                    ->text($notifObject->content)
                    ->html($notifObject->content . "<hr>".$notifObject->description);
            });
            
            $count++;

            // disable message
            $notifObject->status = 2;
            $notifObject->save();

        }
        
        if($count>0){
            $this->info('Les email ont été bien envoyés | '. date("d-m-Y à h:i"));
        }else{
            $this->info('Pas de message envoyé | '. date("d-m-Y à h:i"));
        }
        

    }
}
