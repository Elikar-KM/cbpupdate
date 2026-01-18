<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;
use App\Models\Investor;
use App\Models\Recharge;
use App\Models\User;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class InvestorController extends Controller
{
    public function index(Request $request)
    {
        if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        // On permet l'accès à tous les utilisateurs authentifiés, mais on filtrera les données plus bas.

        try {
            $condition_array = [];
            
            // Si l'utilisateur n'est pas super-admin, on filtre pour ne montrer que SES investissements
            if ($user->role !== "super-admin") {
                $condition_array['sku_user'] = $user->sku_user;
            }

            // status filter
            if (isset($request['status']) and !empty($request['status'])) {
                $statusFilter = 0;
                if ($request['status'] == "active") {
                    $statusFilter = 1;
                } elseif ($request['status'] == "inactive") {
                    $statusFilter = 2;
                }
                $condition_array['status'] =  $statusFilter;
            }

            // type filter
            if (isset($request['type']) and !empty($request['type'])) {
                $condition_array['type'] = $request['type'];
            }
            
            // Sorting defaults
            $sortField = (isset($request['sortBy']) ? $request['sortBy'] : 'id');
            $sortMethod = (isset($request['sortDesc']) && $request['sortDesc'] == 'true' ? 'ASC' : 'DESC');

            if (isset($request['q']) and !empty($request['q'])) {
                // Recherche simple (à améliorer si besoin)
                $investorsInfos = Investor::with(["Subscriptions", "User"])
                    ->where($condition_array)
                    ->where(function($query) use ($request) {
                        $query->where('package', 'LIKE', "%" . $request['q'] . "%")
                              ->orWhere('sku_investor', 'LIKE', "%" . $request['q'] . "%");
                    })
                    ->orderBy($sortField, $sortMethod)
                    ->take($request['perPage'] ?? 10)
                    ->get();
                    
                 return response()->json([
                    'data' => $investorsInfos,
                    'totalData' => count($investorsInfos), // Approximation pour la recherche
                    'message' => "Résultats de recherche"
                ]);

            } elseif (isset($request['perPage']) and !empty($request['perPage'])) {
                // Pagination
                $perPage = $request['perPage'];
                $page = $request['page'] ?? 1;
                
                $investorsInfos = Investor::with(["Subscriptions", "User"])
                    ->where($condition_array)
                    ->orderBy($sortField, $sortMethod)
                    ->skip(($page - 1) * $perPage)
                    ->take($perPage)
                    ->get();

                $totalData = Investor::where($condition_array)->count();

                return response()->json([
                    'data' => $investorsInfos,
                    'totalData' => $totalData,
                    'message' => "Liste paginée"
                ]);

            } else {
                // Get all (filtré par user si non admin)
                $investors = Investor::with(["Subscriptions", "User"])
                    ->where($condition_array)
                    ->orderBy('created_at', 'desc')
                    ->get();

                return response()->json([
                    'data' => $investors,
                    'totalData' => count($investors),
                    'message' => "Liste complète"
                ]);
            }
        } catch (\Throwable $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenue lors de la récupération des données: " . $ex->getMessage()
                ],
                500
            );
        }
    }

    public function store(Request $request)
    {
        if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        if ($user->role == "super-admin") {
            // ok
        } else {
            return response()->json(
                [
                    'message' => "Accès Réfusé; contacter l'administrateur du système svp",
                ],
                202
            );
        }

        try {

            /*  //search investor
            $search_response = Investor::where(["sku_user"=> $request->sku_user])
            ->get()->toArray();
            if(is_array($search_response) && count($search_response)>0){
                return response()->json(
                    [
                        'message' => "L'investisseur existe déjà dans le système"
                    ], 404
                );
            } */

            // check
            if ($request->sku_user == $request->sku_user_parent) {
                return response()->json(
                    [
                        'message' => "L'investisseur ne peut pase se parrainer lui même"
                    ],
                    404
                );
            }

            //search investor user data
            $email = $request->sku_user;
            $search_user_data = User::where(["email" => $email])
                ->get()->toArray();
            if (!is_array($search_user_data) && count($search_user_data) > 0) {
                return response()->json(
                    [
                        'message' => "L'adresse email de l'investisseur n'existe pas dans le système"
                    ],
                    404
                );
            }
            // parent
            $search_user_parent_data = User::where(["email" => $email])
                ->get()->toArray();
            if (!is_array($search_user_parent_data) && count($search_user_parent_data) > 0) {
                return response()->json(
                    [
                        'message' => "L'adresse email du parrain n'existe pas dans le système"
                    ],
                    404
                );
            }

            // user ref
            $real_sku_user = $search_user_data[0]['sku_user'];

            // parent ref
            $real_sku_user_parent = $search_user_parent_data[0]['sku_user'];

            $investor = Investor::where(["sku_user" => $real_sku_user])->first();
            $data = $request->all();

            if ($investor->type == "Migré") {
                return response()->json(
                    [
                        'message' => "Investisseur déjà migré",
                    ],
                    500
                );
            }

            // investor
            if ($request->stop_gain == true) {
                $investor->stop_gain = 1;
            }

            $investor->amount_paid = $request->amount_paid;
            $investor->date_start = $request->date_start;
            $investor->sku_user_parent = $real_sku_user_parent;
            $investor->type = "Migré";
            $investor->save();

            $rechargeGeneratedID = "RC" . date("m") . (count(Recharge::all()) + 5000 + 1);
            $rechargeGeneratedPaymentCode = "A-M" . date("m") . (count(Recharge::all()) + 5000 + 1);

            //create new...
            $rechargeNew = new Recharge();
            $rechargeNew->sku_recharge =  $rechargeGeneratedID;
            $rechargeNew->sku_user = $search_user_data[0]['sku_user'];
            // $rechargeNew->package_code = $search_user_data[0]['role'];
            $rechargeNew->amount = $request->amount_paid;
            $rechargeNew->currency = "USD";
            $rechargeNew->payment_method = "Auto-Migré";
            $rechargeNew->payment_code  = $rechargeGeneratedPaymentCode;
            $rechargeNew->status = 1;

            $rechargeNew->save();

            return response()->json(
                [
                    'message' => "Migration de l'Investisseur Effectuée"
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

    public function show($id)
    {
        if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        if ($user->role == "super-admin") {
            // ok
        } else {
            return response()->json(
                [
                    'message' => "Accès Réfusé; contacter l'administrateur du système svp",
                ],
                202
            );
        }

        try {
            $investorInfos = Investor::find($id);
            return response()->json(
                [
                    'data' => $investorInfos,
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

    public function calculateGains()
    {
        if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        if ($user->role == "super-admin") {
            // ok
        } else {
            return response()->json(
                [
                    'message' => "Accès Réfusé; contacter l'administrateur du système svp",
                ],
                202
            );
        }

        try {

        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de modification"
                ],
                404
            );
        }
    }

    public function update(Request $request)
    {
        if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        if ($user->role == "super-admin") {
            // ok
        } else {
            return response()->json(
                [
                    'message' => "Accès Réfusé; contacter l'administrateur du système svp",
                ],
                202
            );
        }

        return response()->json(
            [
                'message' => "Accès Réfusé"
            ],
            404
        );

        try {
            $investor = Investor::find($request->id);
            $data = $request->all();
            foreach ($data as $key => $value) {
                if ($key != "sku_investor" && $key != "sku_investor" && $key != "created_at" && $key != "updated_at" && $key != "id" && $value != "null") {
                    if (is_array($value)) {
                        // convert to json string
                        $investor->$key = json_encode($value);
                    } else {
                        if ($key != "sku_investor" && $value != "null") {
                            $investor->$key = $value;
                        }
                    }
                }
            }

            $investor->save();
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
        if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        if ($user->role == "super-admin") {
            // ok
        } else {
            return response()->json(
                [
                    'message' => "Accès Réfusé; contacter l'administrateur du système svp",
                ],
                202
            );
        }

        return response()->json(
            [
                'message' => "Accès Réfusé"
            ],
            203
        );

        try {
            $investor = Investor::find($id);
            $investor->delete();
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
