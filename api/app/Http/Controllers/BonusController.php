<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Bonus;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class BonusController extends Controller
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
            $condition_array['sku_user'] = $user->sku_user;
           /*  if($user -> role != "super-admin"){
                $condition_array['sku_user'] = $user->sku_user;
            } */

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

            $sortField = (isset($request['sortBy']) ? $request['sortBy'] : 'id');
            $sortMethod = ($request['sortDesc'] == true ? 'DESC' : 'ASC');

            // paging limit filter
            if (isset($request['perPage']) and !empty($request['perPage'])) {
                // $condition_array[$request['perPage']] = $request['perPage'];
                // ->where([['title', 'LIKE', "%" . $text_val . "%"]])

                if ($request['page'] == 1) {
                    // premiere page
                    $bonussInfos = Bonus::where($condition_array)
                        ->orderBy($sortField, $sortMethod)->skip(0)
                        ->take($request['perPage'])
                        ->get();
                } else {
                    $bonussInfos = Bonus::where($condition_array)
                        ->orderBy($sortField, $sortMethod)
                        ->skip(($request['page'] * $request['perPage']) - $request['perPage'])
                        ->take($request['perPage'])
                        ->get();
                }

                // custom return
                return response()->json(
                    [
                        'data' => $bonussInfos,
                        "totalData" => count(Bonus::where($condition_array)->get()),
                        'message' => "Liste des elements"
                    ]
                );
            } else {
                // get all
                $condition_array = ['status' => null];
                
                // Filter by user if not super-admin (although already handled at start of method, good to be safe)
                if ($user->role !== "super-admin") {
                    $condition_array['sku_user'] = $user->sku_user;
                }

                return response()->json(
                    [
                        'data' => Bonus::where($condition_array)->get(),
                        "totalData" => count(Bonus::where($condition_array)->get()),
                        'message' => "Liste des elements"
                    ]
                );
            }
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de recuperation des données"
                ], 404
            );
        }
    }

    public function store(Request $request, $data=null)
    {
        try {

            //search
            $search_response = Bonus::where(["sku_user"=> $data->sku_user,"sku_user_origin"=> $data->sku_user,"reference"=> $data->sku_user,"designation"=> $data->sku_user,"origin"=> $data->sku_user])->get()->toArray();
            if(is_array($search_response) && count($search_response)>0){
                return response()->json(
                    [
                        'message' => "Le bonus existe déjà dans le système"
                    ], 404
                );
            }

            // check
            if($data->sku_user == $data->sku_user_parent){
                return response()->json(
                    [
                        'message' => "Le membre parrain ne peut pase se parrainer lui même"
                    ], 404
                );
            }

            $bonus = new Bonus();
            // $data = $request->all();

            if($request->stop_bonus == true){
                $bonus->stop_bonus = 1;
            }

            foreach ($data as $key => $value) {
                if (is_array($value)) {
                    // convert to json string
                    $bonus->$key = json_encode($value);
                } else {
                    if ($key != "sku_bonus" && $value != "null") {
                        $bonus->$key = $value;
                    }
                }
            }

            $bonus->save();

            // parent update
            /* $parent_bonus = Bonus::where("sku_user", $request->sku_user_parent);
            $parent_bonus->childs = ($bonus->childs+1);
            $parent_bonus->save(); */

            return response()->json(
                [
                    'message' => "Enregistrement du bonus Effectué",
                    'status' => 200
                ]
            );
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de l'enregistrement",
                    'status' => 404
                ], 404
            );
        }
    }

    public function show($id)
    {
        try {
            $bonusInfos = Bonus::find($id);
            return response()->json(
                [
                    'data' => $bonusInfos,
                    'message' => "Information de l'element"
                ]
            );
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de recuperation des informations de l'element"
                ], 404
            );
        }
    }

    public function update(Request $request)
    {

        return response()->json(
            [
                'message' => "Accès Réfusé"
            ], 404
        );

        try {
            $bonus = Bonus::find($request->id);
            $data = $request->all();
            foreach ($data as $key => $value) {
                if ($key != "sku_bonus" && $key != "sku_bonus" && $key != "created_at" && $key != "updated_at" && $key != "id" && $value != "null") {
                    if (is_array($value)) {
                        // convert to json string
                        $bonus->$key = json_encode($value);
                    } else {
                        if ($key != "sku_bonus" && $value != "null") {
                            $bonus->$key = $value;
                        }
                    }
                }
            }

            $bonus->save();
            return response()->json(
                [
                    'message' => "Mise a jour investisseur effectuée"
                ]
            );
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de modification"
                ], 404
            );
        }
    }

    public function destroy($id)
    {
        return response()->json(
            [
                'message' => "Accès Réfusé"
            ], 203
        );

        try {
            $bonus = Bonus::find($id);
            $bonus->delete();
            return response()->json(
                [
                    'message' => "Suppression de l'element effectuée"
                ]
            );
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de la suppression"
                ], 404
            );
        }
    }
}
