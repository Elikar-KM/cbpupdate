<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Corporation;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class notificationController extends Controller
{

    public function sendNotifications()
    {
        if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        // -------------------------------------
        $corporationData = Corporation::find(1);

        // Write your database logic we bellow:
        // algo
        $notifications = Notification::where(["status" => 1])
            ->get();

        foreach ($notifications as $notifKey => $notifObject) {

            \Illuminate\Support\Facades\Mail::send([], [], function (\Illuminate\Mail\Message $message) use ($notifObject) {
                $message
                    ->from('cbp@cbpcommunity.com')
                    ->to($notifObject->email_destination)
                    ->subject($notifObject->object)
                    ->text($notifObject->content)
                    ->html($notifObject->content . "<hr>" . $notifObject->description);
            });

            // disable message
            $notifObject->status = 2;
            $notifObject->save();

            //sleep for 1 second
            sleep(1);
        }

        return response()->json(
            [
                "message" => 'Les email ont été bien envoyés | ' . date("d-m-Y à h:i"),
                "msgtasktimeout" => $corporationData->send_message_task,
            ]
        );
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        //  $stores = Store::where('owner_id', $user->id)->get();

        $notifications = Notification::where("sku_user", $user->sku_user)->get();

        // return $stores;
        return response()->json(['data' => $notifications], 200);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        $validator = Validator::make($request->all(), [
            'content' => 'required',
            'description' => 'required',
            'object' => 'required',
            'type' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()])->setStatusCode(404);
        }

        try {
            $notification = new Notification();
            $data = $request->all();

            foreach ($data as $key => $value) {
                if (is_array($value)) {
                    // convert to json string
                    $notification->$key = json_encode($value);
                } else {
                    if ($value != "null") {
                        $notification->$key = $value;
                    }
                }
            }

            $notification->ref = 'cbp@cbpcommunity.com';
            $notification->date = date("d-m-Y");

            // get destination infos
            $destinationUser = User::where(['sku_user' => $request->sku_user])->first(['email', 'fullName']);
            $notification->email = $destinationUser->email;
            $notification->destination_name = $destinationUser->fullName;
            $notification->save();

            // email message
            /* \Illuminate\Support\Facades\Mail::send([], [], function (\Illuminate\Mail\Message $message) use ($destinationUser, $request) {
                $message
                    ->from('cbp@cbpcommunity.com')
                    ->to($destinationUser->email)
                    ->subject($request->type . " | " . $request->object)
                    ->text($request->description)
                    ->html($request->content);
            }); */

            /* $newNotification = new Notification();
            $newNotification->sku_user = $userNew->sku_user;
            $newNotification->sku_notification = "NTF-0" . count(Notification::all());
            $newNotification->type =  $request->type;
            $newNotification->ref = 'cbp@cbpcommunity.com';
            $newNotification->date = date("d/m/Y");
            $newNotification->destination_name = $destinationUser->fullName;
            $newNotification->destination_description = "";
            $newNotification->destination_adress = "";
            $newNotification->destination_gender = "";
            $newNotification->header = "CBP Notification!";
            $newNotification->object = $request->type . " | " . $request->object;
            $newNotification->content = $request->description;
            $newNotification->description = $request->content;
            $newNotification->email_destination = $destinationUser->email;
            $newNotification->save();*/

            return response()->json(
                [
                    'message' => "Envoie de notification effectué",
                    'code' => 200
                ]
            );
        } catch (HttpException $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de l'envoie de notification",
                    'code' => 205
                ]
            );
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Notification  $notification
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        if (!$data_response = Notification::find($id)) {
            throw new NotFoundHttpException('Notification non trouvé de ref= ' . $id);
        }
        return response()->json(['message' => 'Notification infos', 'data' => $data_response]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Notification  $notification
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {

        if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        $notification = Notification::find($id);
        $data = $request->all();
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                // convert to json string
                $notification->$key = json_encode($value);
            } else {
                if ($key != "sku_corporation" && $key != "sku_notification" && $key != "created_at" && $key != "updated_at" && $key != "id" && $value != "null") {
                    $notification->$key = $value;
                }
            }
        }

        // update user who update
        $notification->sku_user = $user->sku_user;
        $notification->save();
        return response()->json(
            [
                'message' => "Mise a jour notification effectuée",
                'code' => 200
            ]
        );
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Notification  $notification
     * @return \Illuminate\Http\Response
     */
    public function destroy(Notification $notification)
    {
        //
    }
}
