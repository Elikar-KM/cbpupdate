<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Package;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class PackageController extends Controller
{
    public function index(Request $request)
    {
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

            $sortField = (isset($request['sortBy']) ? $request['sortBy'] : 'id');
            $sortMethod = ($request['sortDesc'] == true ? 'ASC' : 'DESC');

            // paging limit filter
            if (isset($request['perPage']) and !empty($request['perPage'])) {
                // $condition_array[$request['perPage']] = $request['perPage'];
                // ->where([['title', 'LIKE', "%" . $text_val . "%"]])

                if ($request['page'] == 1) {
                    // premiere page
                    $packagesInfos = Package::where($condition_array)
                        ->orderBy($sortField, $sortMethod)->skip(0)
                        ->take($request['perPage'])
                        ->get();
                } else {
                    $packagesInfos = Package::where($condition_array)
                        ->orderBy($sortField, $sortMethod)
                        ->skip(($request['page'] * $request['perPage']) - $request['perPage'])
                        ->take($request['perPage'])
                        ->get();
                }

                // custom return
                return response()->json(
                    [
                        'data' => $packagesInfos,
                        "totalData" => count(Package::where($condition_array)->get()),
                        'message' => "Liste des elements",
                        'code' => 200
                    ]
                );
            } else {
                // get all
                $condition_array = ['status' => 1];
                return json_encode( ['data' => Package::where($condition_array)->get() ]);
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

    public function store(Request $request)
    {
        if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        try {
            $package = new Package();
            $data = $request->all();

            foreach ($data as $key => $value) {
                if (is_array($value)) {
                    // convert to json string
                    $package->$key = json_encode($value);
                } else {
                    if ($key != "sku_package" && $value != "null") {
                        $package->$key = $value;
                    }
                }
            }

            $package->save();
            return response()->json(
                [
                    'message' => "Enregistrement du Package Effectué",
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
        if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        try {
            $packageInfos = Package::find($id);
            return response()->json(
                [
                    'data' => $packageInfos,
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

        if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        return response()->json(
            [
                'message' => "Accès Réfusé",
                'code' => 404
            ]
        );

        try {
            $package = Package::find($request->id);
            $data = $request->all();
            foreach ($data as $key => $value) {
                if ($key != "sku_package" && $key != "sku_package" && $key != "created_at" && $key != "updated_at" && $key != "id" && $value != "null") {
                    if (is_array($value)) {
                        // convert to json string
                        $package->$key = json_encode($value);
                    } else {
                        if ($key != "sku_package" && $value != "null") {
                            $package->$key = $value;
                        }
                    }
                }
            }

            $package->save();
            return response()->json(
                [
                    'message' => "Mise a jour package effectuée",
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
        return response()->json(
            [
                'message' => "Accès Réfusé",
                'code' => 203
            ]
        );

        try {
            $package = Package::find($id);
            $package->delete();
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
