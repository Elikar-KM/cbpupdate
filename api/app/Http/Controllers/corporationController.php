<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Corporation;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Exception;

class corporationController extends Controller
{

    public function store(Request $request)
    {
        if(!$user=auth()->user()){
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        try {
            $corporation = new Corporation();
            $data = $request->all()['corporation'];

            foreach ($data as $key => $value) {
                if ($key != "sku_user" && $value != "null") {
                    $corporation->$key = $value;
                }
            }

            $corporation['sku_corporation'] = "ETS" . strtoupper(date("dmyis"));
            $corporation->save();
            return response()->json(
                [
                    // 'data' => json_decode($data),
                    'message' => "Enregistrement de l'Entreprise Effectué",
                    'code' => 200
                ]
            );
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Echec Enregistrement de l'Entreprise",
                    'code' => 400
                ]
            );
        }
    }

    public function uploadCorporationLogo(Request $request)
    {

        if(!$user=auth()->user()){
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        try {
            $folder = "logos";
            $full_destination_path = public_path($folder);
            $file_name = $request->sku_corporation . "-" . date("dmyis") . "-logo.png";
            $request->logo->move($full_destination_path, $file_name);

            $final_name_mini = $folder . "/" . $file_name;

            // update table infos
            $corporation = Corporation::where(["id" => intval("1")])->first();
            $corporation->logo_url = $final_name_mini;
            $corporation->save();

            // 'full_url' => url($final_name_mini),
            return response()->json(
                [
                    'full_url' => $final_name_mini,
                    'message' => "Mise a jour logo effectuée",
                    'code' => 200
                ]
            );
        } catch (Exception $ex) {
            return response()->json(
                [
                    'full_url' => "",
                    'message' => "Erreur envoi photo au serveur.",
                    'code' => 300
                ]
            );
        }
    }

    public function show($id)
    {

        if(!$user=auth()->user()){
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        try {
            $corporationInfos = Corporation::where(["sku_corporation"=> $user->sku_corporation])->first();

            if (!$corporationInfos) {
                return response()->json([
                    'message' => "Aucune entreprise associée à cet utilisateur.",
                    'code' => 404
                ], 404);
            }

            $full_destination_url = $corporationInfos->logo_url;

            return response()->json(
                [
                    'data' => $corporationInfos,
                    'corporationLogo' => $full_destination_url,
                    'message' => "Corporation Infos",
                    'code' => 200
                ]
            );
        } catch (HttpException $th) {
            throw $th;
        }
    }


    public function index()
    {
        if(!$user=auth()->user()){
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        $corporations = Corporation::all();
        return response()->json(
            [
                'message' => "Corporations",
                'data' => $corporations,
                'code' => 200
            ]
        );
    }

    public function update(Request $request)
    {

        if(!$user=auth()->user()){
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        $corporation = Corporation::where(['id'=> intval("1")])->first();

        $data = $request->all();

        // Handle login cover image upload
        if ($request->hasFile('login_cover')) {
            $folder = "login_covers";
            $full_destination_path = public_path($folder);

            // Create folder if it doesn't exist
            if (!file_exists($full_destination_path)) {
                mkdir($full_destination_path, 0777, true);
            }

            $file_name = $corporation->sku_corporation . "-" . date("dmyis") . "-login-cover.png";
            $request->file('login_cover')->move($full_destination_path, $file_name);

            $corporation->login_cover_image = $folder . "/" . $file_name;
        }

        foreach ($data as $key => $value) {
            if ($key != "sku_corporation" && $key != "login_cover" && $value != "null") {
                if ($value === true or $value === 'true') {
                    $corporation->$key = 1;
                } elseif ($value === false or $value === 'false') {
                    $corporation->$key = 0;
                } else {
                    if (is_array($value)) {
                        $corporation->$key = json_encode($value);
                    } elseif ($value == "" or $value == "null" or $value == "undefined") {
                        // ignore
                    } else {
                        $corporation->$key = $value;
                    }
                }
            }
        }

        $corporation->save();
        return response()->json(
            [
                'message' => "Mise a jour de l'Organisation effectuée",
                'code' => 200
            ]
        );
    }

    public function destroy($id)
    {
        if(!$user=auth()->user()){
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        $corporation = Corporation::where(['id'=> $id])->first();
        $corporation->delete();
        return response()->json(
            [
                'message' => "Suppression de l'Organisation effectuée",
                'code' => 200
            ]
        );
    }

    public function publicInfos()
    {
        $corporation = Corporation::where(['id' => 1])->first();

        if (!$corporation) {
             return response()->json(['message' => 'No corporation found'], 404);
        }

        $logo_url = $corporation->logo_url
            ? (str_starts_with($corporation->logo_url, 'http')
                ? $corporation->logo_url
                : url($corporation->logo_url))
            : null;

        $login_cover_url = $corporation->login_cover_image
            ? (str_starts_with($corporation->login_cover_image, 'http')
                ? $corporation->login_cover_image
                : url($corporation->login_cover_image))
            : null;

        return response()->json([
            'data' => [
                'logo_url' => $logo_url,
                'corporation_name' => $corporation->corporation_name,
                'corporation_name_mini' => $corporation->corporation_name_mini,
                'login_cover_image' => $login_cover_url,
                'login_title' => $corporation->login_title,
                'login_subtitle' => $corporation->login_subtitle,
            ],
            'code' => 200
        ]);
    }
}
