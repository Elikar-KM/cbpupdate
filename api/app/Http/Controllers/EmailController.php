<?php

namespace App\Http\Controllers;

class EmailController extends Controller
{
    public function index()
    {
        $userData=[
            "sku_user"=>"U0000000001",
            "title"=>"Test Email Service",
            "message"=>"Bienvenu sur le services de notification CBP",
        ];
        \Illuminate\Support\Facades\Mail::send([], $userData, function (\Illuminate\Mail\Message $message) use ($userData) {
                $message
                ->from('cbp@cbpcommunity.com')
                ->to('elikarkanane@gmail.com')
                ->cc('elikartkm@gmail.com')
                //->bcc('bikanaan.elikart@gmail.com')
                // ->replyTo('fabienseko@gmail.com')
                ->subject($userData['title'])
                ->text($userData['message'])
                ->html('<p>Vous pouvez nous rejoindre a tout moment de la journée</p>');
        });

        echo "Message envoyé.";

        /* $testMailData = [
            'title' => 'Test Email From AllPHPTricks.com',
            'body' => 'This is the body of test email.'
        ];

        Mail::to('elikarkanane@gmail.com')->send(new SendMail($testMailData));

        dd('Success! Email has been sent successfully.'); */
    }
}
