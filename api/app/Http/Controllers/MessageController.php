<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $messages = [
            "newMessages" => "6 Nouveaux Messages",
            "notifications" => [
                [
                    "title" => "Felicitation ICT 🎉",
                    "avatar" => 'require("@/assets/images/avatars/6-small.png")',
                    "subtitle" => "Vous avez bien résolu le souci du réseau local",
                    "type" => "light-success",
                ],
                [
                    "title" => "Nouveau Message Réçu",
                    "avatar" => 'require("@/assets/images/avatars/9-small.png")',
                    "subtitle" => "Vous avez 10 messages non lus",
                    "type" => "light-info",
                ],
                [
                    "title" => "Ordre de Rappel 👋",
                    "avatar" => "MD",
                    "subtitle" => "Vous devez re-contacter le tribunal",
                    "type" => "light-danger",
                ],
            ],
            "systemNotifications" => [
                [
                    "title" => "Server hors ligne",
                    "subtitle" => "Notre serveur a été déconnecté a cause du sercharge de CPU",
                    "type" => "light-danger",
                    "icon" => "XIcon",
                ],
                [
                    "title" => "Rapport d'achat bien crée",
                    "subtitle" => "Le rapport du mois passée a été bien réneré",
                    "type" => "light-success",
                    "icon" => "CheckIcon",
                ],
                [
                    "title" => "Surchauffe du CPU",
                    "subtitle" => "Déconnecter certaines applications s'il vous plait",
                    "type" => "light-warning",
                    "icon" => "AlertTriangleIcon",
                ],
            ]
        ];

        return response()->json([
            "data" => $messages,
            "message" => "Messages"
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Message  $message
     * @return \Illuminate\Http\Response
     */
    public function show(Message $message)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Message  $message
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Message $message)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Message  $message
     * @return \Illuminate\Http\Response
     */
    public function destroy(Message $message)
    {
        //
    }
}
