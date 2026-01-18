<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Gain;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use App\Models\Package;
use App\Models\Subscription;
use App\Models\User;
use App\Http\Controllers\FunctionCollection;

class GainController extends Controller
{
    public function index(Request $request)
    {
        // check if user exists and logged in
        if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        try {
            $condition_array = [];
            $condition_array['sku_user'] = $user->sku_user;

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
            $sortMethod = ($request['sortDesc'] == true ? 'ASC' : 'DESC');

            if($user->role!="super-admin"){
                $condition_array['sku_user'] = $user->sku_user;
            }

            // paging limit filter
            if (isset($request['perPage']) and !empty($request['perPage'])) {

                if ($request['page'] == 1) {
                    // premiere page
                    $gainsInfos = Gain::where($condition_array)
                        ->orderBy($sortField, $sortMethod)->skip(0)
                        ->take($request['perPage'])
                        ->get();
                } else {
                    $gainsInfos = Gain::where($condition_array)
                        ->orderBy($sortField, $sortMethod)
                        ->skip(($request['page'] * $request['perPage']) - $request['perPage'])
                        ->take($request['perPage'])
                        ->get();
                }

                // custom return
                return response()->json(
                    [
                        'data' => $gainsInfos,
                        "totalData" => count(Gain::where($condition_array)->get()),
                        "condition_array" => $condition_array,
                        'message' => "Liste des elements",

                    ]
                );
            } else {
                // get all
                $condition_array = ['sku_user' => $user->sku_user];

                return json_encode(
                    [
                        'data' => Gain::where($condition_array)->get(),
                        "totalData" => count(Gain::where($condition_array)->get()),
                        "condition_array" => $condition_array,
                        'message' => "Liste des elements"
                    ]
                );
            }
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de recuperation des données"
                ],
                404
            );
        }
    }

    public function store(Request $request)
    {
        try {

            //search
            $search_response = Gain::where(["sku_user" => $request->sku_user])->get()->toArray();
            if (is_array($search_response) && count($search_response) > 0) {
                return response()->json(
                    [
                        'message' => "Le gain existe déjà dans le système"
                    ],
                    404
                );
            }

            // check
            if ($request->sku_user == $request->sku_user_parent) {
                return response()->json(
                    [
                        'message' => "Le gain ne peut pase se parrainer lui même"
                    ],
                    404
                );
            }

            $gain = new Gain();
            $data = $request->all();

            if ($request->stop_gain == true) {
                $gain->stop_gain = 1;
            }

            foreach ($data as $key => $value) {
                if (is_array($value)) {
                    // convert to json string
                    $gain->$key = json_encode($value);
                } else {
                    if ($key != "sku_gain" && $value != "null") {
                        $gain->$key = $value;
                    }
                }
            }

            $gain->save();

            return response()->json(
                [
                    'message' => "Enregistrement de l'Investisseur Effectué"
                ]
            );
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de l'enregistrement"
                ],
                404
            );
        }
    }

    public function gain_infos($sku_user)
    {
        try {
            $gainInfos = Gain::find($sku_user);
            return response()->json(
                [
                    'data' => $gainInfos,
                    'message' => "Details des gains journaliers"
                ]
            );
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de recuperation des informations de l'element"
                ],
                404
            );
        }
    }

    public function show($id)
    {
        try {
            $gainInfos = Gain::find($id);
            return response()->json(
                [
                    'data' => $gainInfos,
                    'message' => "Information de l'element"
                ]
            );
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de recuperation des informations de l'element"
                ],
                404
            );
        }
    }

    public function update(Request $request)
    {

        return response()->json(
            [
                'message' => "Accès Réfusé"
            ],
            404
        );

        try {
            $gain = Gain::find($request->id);
            $data = $request->all();
            foreach ($data as $key => $value) {
                if ($key != "sku_gain" && $key != "sku_gain" && $key != "created_at" && $key != "updated_at" && $key != "id" && $value != "null") {
                    if (is_array($value)) {
                        // convert to json string
                        $gain->$key = json_encode($value);
                    } else {
                        if ($key != "sku_gain" && $value != "null") {
                            $gain->$key = $value;
                        }
                    }
                }
            }

            $gain->save();
            return response()->json(
                [
                    'message' => "Mise a jour investisseur effectuée"
                ]
            );
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de modification"
                ],
                404
            );
        }
    }

    public function destroy($id)
    {
        return response()->json(
            [
                'message' => "Accès Réfusé"
            ],
            203
        );

        try {
            $gain = Gain::find($id);
            $gain->delete();
            return response()->json(
                [
                    'message' => "Suppression de l'element effectuée"
                ]
            );
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de la suppression"
                ],
                404
            );
        }
    }
}
