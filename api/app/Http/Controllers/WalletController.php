<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Wallet;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class WalletController extends Controller
{
    public function index(Request $request)
    {

        try {
            // check if user exists and logged in
            if (!$user = auth()->user()) {
                throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
            }
        } catch (HttpException $th) {
            throw $th;
        }

        $wallet_type_crypto = [];
        $wallet_type_crypto[0] = ["name"=> "USDT BEP20"];
        $wallet_type_crypto[1] = ["name"=> "USDT TRC20"];
        $wallet_type_crypto[2] = ["name"=> "Ethereum"];
        $wallet_type_crypto[3] = ["name"=> "BitCoin"];
        $wallet_type_crypto[4] = ["name"=> "BitCoin Cash"];

        try {
            $condition_array = [];
            // status filter
            $statusFilter = 0;
            if (isset($request['status']) and !empty($request['status'])) {
                if ($request['status'] == "active") {
                    $statusFilter = 1;
                } elseif ($request['status'] == "inactive") {
                    $statusFilter = 2;
                } else {
                    $statusFilter = 0;
                }
                $condition_array['status'] =  $statusFilter;
            }

            // type filter
            if (isset($request['type']) and !empty($request['type'])) {
                $condition_array['type'] = $request['type'];
            }
            // attribute filter
            if (isset($request['attribute']) and !empty($request['attribute'])) {
                $condition_array[$request['attribute']] = 1;
            }

            // filter
            if (isset($request['sortBy']) and !empty($request['sortBy'])) {
                // $condition_array[$request['sortBy']] = 1;
            }

            // page filter
            if (isset($request['page']) and !empty($request['page'])) {
                // $condition_array[$request['page']] = 1;
            }

            if($user->role == "super-admin"){
                $condition_array['sku_user'] = "*";
            }else{
                $condition_array['sku_user'] = $user->sku_user;
            }

            $sortField = (isset($request['sortBy']) ? $request['sortBy'] : 'id');
            $sortMethod = ($request['sortDesc'] == true ? 'ASC' : 'DESC');

            // paging limit filter
            if (isset($request['perPage']) and !empty($request['perPage'])) {
                // $condition_array[$request['perPage']] = $request['perPage'];
                // ->where([['title', 'LIKE', "%" . $text_val . "%"]])

                if ($request['page'] == 1) {
                    // premiere page
                    $walletsInfos = Wallet::where($condition_array)
                        ->orderBy($sortField, $sortMethod)->skip(0)
                        ->take($request['perPage'])
                        ->get();
                } else {
                    $walletsInfos = Wallet::where($condition_array)
                        ->orderBy($sortField, $sortMethod)
                        ->skip(($request['page'] * $request['perPage']) - $request['perPage'])
                        ->take($request['perPage'])
                        ->get();
                }

                // custom return
                return response()->json(
                    [
                        'data' => $walletsInfos,
                        'system_wallets' => Wallet::where("sku_user", "*")->get()->toArray(),
                        'wallet_type_crypto' => $wallet_type_crypto,
                        'totalData' => count(Wallet::where($condition_array)->get()),
                        'message' => "Liste des elements",
                        'code' => 200
                    ]
                );
            } else {
                // get all
                if($user->role == "super-admin"){
                    $condition_array['sku_user'] = "*";
                }else{
                    $condition_array['sku_user'] = $user->sku_user;
                }
                return response()->json(
                    [
                        'data' => Wallet::where($condition_array)->get()->toArray(),
                        'wallets' => Wallet::where("sku_user", $user->sku_user)->get(),
                        'system_wallets' => Wallet::where("sku_user", "*")->get()->toArray(),
                        'wallet_type_crypto' => $wallet_type_crypto,
                        'totalData' => count(Wallet::where($condition_array)->get()),
                        'message' => "Liste des elements",
                        'code' => 200
                    ]
                );
            }
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de recuperation des données",
                    'code' => 500
                ]
            );
        }
    }

    public function WalletTypes(Request $request){

        $walletTypes = array(
            ["type"=> "bitcoin", "name"=>"Bitcoin"],
            ["type"=> "usdt", "name"=>"USDT"],
            ["type"=> "airtel-money", "name"=>"Airtel Money"],
            ["type"=> "m-pesa", "name"=>"M-Pesa"],
            ["type"=> "orange-money", "name"=>"Orange Money"],
        );

        return response()->json(
            [
                'data' => $walletTypes,
                'message' => "Liste des elements",
                'code' => 200
            ]
        );
    }

    public function store(Request $request)
    {

        try {
            // check if user exists and logged in
            if (!$user = auth()->user()) {
                throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
            }
        } catch (HttpException $th) {
            throw $th;
        }

        try {

            // check if wallet name / account / value exists
            $walletExists = Wallet::where(['name' => $request->name])->get();
            $data_return = [];
            if (count($walletExists) > 0) {
                // no existing parring
                return response()->json(
                    [
                        'message' => "Le wallet ".$request->type.": ".$request->name." existe dans le système",
                    ],400
                );
            }

            $wallet = new Wallet();
            $data = $request->all();

            if($user->role == "super-admin"){
                $wallet->sku_user = "*";
            }else{
                $wallet->sku_user = $user->sku_user;
            }

            foreach ($data as $key => $value) {
                if (is_array($value)) {
                    // convert to json string
                    $wallet->$key = json_encode($value);
                } else {
                    if ($key != "sku_wallet" && $value != "null") {
                        $wallet->$key = $value;
                    }
                }
            }

            $wallet->save();
            return response()->json(
                [
                    'message' => "Enregistrement portefeuille Effectué",
                    'code' => 200
                ]
            );
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de l'enregistrement",
                    'code' => 500
                ]
            );
        }
    }

    public function show($id)
    {
        try {
            // check if user exists and logged in
            if (!$user = auth()->user()) {
                throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
            }
        } catch (HttpException $th) {
            throw $th;
        }

        try {
            $walletInfos = Wallet::find($id);
            // $full_destination_url = url($walletInfos["image"]);
            // append image full url //
            // $walletInfos['image_url'] = $full_destination_url;
            // $walletInfos['modules'] = '[{"sku_wallet_parent":null,"sku_module":"module-1663742309717","name":"A propos du logiciel","route":"get-start","icon":null}]';
            return response()->json(
                [
                    'data' => $walletInfos,
                    'message' => "Information de l'element",
                    'code' => 200
                ]
            );
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de recuperation des informations de l'element",
                    'code' => 500
                ]
            );
        }
    }



    public function update(Request $request)
    {
        try {
            // check if user exists and logged in
            if (!$user = auth()->user()) {
                throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
            }
        } catch (HttpException $th) {
            throw $th;
        }

        try {
            $wallet = Wallet::find($request->id);
            $data = $request->all();
            foreach ($data as $key => $value) {
                if ($key != "sku_wallet" && $key != "sku_wallet" && $key != "created_at" && $key != "updated_at" && $key != "id" && $value != "null") {
                    if (is_array($value)) {
                        // convert to json string
                        $wallet->$key = json_encode($value);
                    } else {
                        if ($key != "sku_wallet" && $value != "null") {
                            $wallet->$key = $value;
                        }
                    }
                }
            }

            $wallet->save();
            return response()->json(
                [
                    'message' => "Mise a jour wallet effectuée",
                    'code' => 200
                ]
            );
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de modification",
                    'code' => 500
                ]
            );
        }
    }

    public function destroy($id)
    {
        try {
            $wallet = Wallet::find($id);
            $wallet->delete();
            return response()->json(
                [
                    'message' => "Suppression de l'element effectuée",
                    'code' => 200
                ]
            );
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de la suppression",
                    'code' => 500
                ]
            );
        }
    }
}
