<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Account;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class AccountController extends Controller
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

            $condition_array['sku_user'] = $user->sku_user;

            $sortField = (isset($request['sortBy']) ? $request['sortBy'] : 'id');
            $sortMethod = ($request['sortDesc'] == true ? 'ASC' : 'DESC');

            // paging limit filter
            if (isset($request['perPage']) and !empty($request['perPage'])) {
                // $condition_array[$request['perPage']] = $request['perPage'];
                // ->where([['title', 'LIKE', "%" . $text_val . "%"]])

                if ($request['page'] == 1) {
                    // premiere page
                    $accountsInfos = Account::where($condition_array)
                        ->orderBy($sortField, $sortMethod)->skip(0)
                        ->take($request['perPage'])
                        ->get();
                } else {
                    $accountsInfos = Account::where($condition_array)
                        ->orderBy($sortField, $sortMethod)
                        ->skip(($request['page'] * $request['perPage']) - $request['perPage'])
                        ->take($request['perPage'])
                        ->get();
                }

                // custom return
                return response()->json(
                    [
                        'data' => $accountsInfos,
                        "totalData" => count(Account::all()),
                        'message' => "Liste des elements",
                        'code' => 200
                    ]
                );
            } else {
                // get all
                $condition_array = ['status' => null];
                if($user->role != "super-admin"){
                    $condition_array['sku_user'] = $user->sku_user;
                }
                return json_encode(Account::where($condition_array)->get());
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

    public function AccountTypes(Request $request){

        $accountTypes = array(
            ["type"=> "bitcoin", "name"=>"Bitcoin"],
            ["type"=> "usdt", "name"=>"USDT"],
            ["type"=> "airtel-money", "name"=>"Airtel Money"],
            ["type"=> "m-pesa", "name"=>"M-Pesa"],
            ["type"=> "orange-money", "name"=>"Orange Money"],
        );

        return response()->json(
            [
                'data' => $accountTypes,
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
            $account = new Account();
            $data = $request->all();

            if($user->role == "super-admin"){
                $account->sku_user = "*";
            }else{
                $account->sku_user = $user->sku_user;
            }

            foreach ($data as $key => $value) {
                if (is_array($value)) {
                    // convert to json string
                    $account->$key = json_encode($value);
                } else {
                    if ($key != "sku_account" && $value != "null") {
                        $account->$key = $value;
                    }
                }
            }

            // search account -------------------------------------------------------------
            $existant_account = Account::where("sku_user", $user->sku_user)->get();

            // update amount account
            $existant_account -> amount = $request->amount;

            // enregistrer montant
            $existant_account -> save();

            // enregister account
            $account->save();

            return response()->json(
                [
                    'message' => "Enregistrement account effectué",
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
            $accountInfos = Account::find($id);
            // $full_destination_url = url($accountInfos["image"]);
            // append image full url //
            // $accountInfos['image_url'] = $full_destination_url;
            // $accountInfos['modules'] = '[{"sku_account_parent":null,"sku_module":"module-1663742309717","name":"A propos du logiciel","route":"get-start","icon":null}]';
            return response()->json(
                [
                    'data' => $accountInfos,
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
            $account = Account::find($request->id);
            $data = $request->all();
            foreach ($data as $key => $value) {
                if ($key != "sku_account" && $key != "sku_account" && $key != "created_at" && $key != "updated_at" && $key != "id" && $value != "null") {
                    if (is_array($value)) {
                        // convert to json string
                        $account->$key = json_encode($value);
                    } else {
                        if ($key != "sku_account" && $value != "null") {
                            $account->$key = $value;
                        }
                    }
                }
            }

            $account->save();
            return response()->json(
                [
                    'message' => "Mise a jour account effectuée",
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
            $account = Account::find($id);
            $account->delete();
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
