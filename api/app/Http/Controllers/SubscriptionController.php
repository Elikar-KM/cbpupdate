<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Subscription;
use App\Models\Account;
use App\Models\Package;
use App\Models\Bonus;
use App\Http\Controllers\FunctionCollection;
use DateTime;
use Exception;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;


class SubscriptionController extends Controller
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

        $dataCollect = new FunctionCollection();
        $user_repport = $dataCollect->WalletBalance(null, null);

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

            if ($user->role != "super-admin") {
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
                    $subscriptionsInfos = Subscription::with('package')->where($condition_array)
                        ->orderBy($sortField, $sortMethod)->skip(0)
                        ->take($request['perPage'])
                        ->get();
                } else {
                    $subscriptionsInfos = Subscription::with('package')->where($condition_array)
                        ->orderBy($sortField, $sortMethod)
                        ->skip(($request['page'] * $request['perPage']) - $request['perPage'])
                        ->take($request['perPage'])
                        ->get();
                }

                $totalSumRecharged = $user_repport['total_recharge_pack_actuel'];
                $finalDatas = [];
                $eligibilitySumAmount = 0;
                foreach ($subscriptionsInfos as $key => $value) {

                    $date = new DateTime($value["created_at"]);

                    $now = time(); // or your date as well
                    $your_date = strtotime($value["created_at"]);
                    $datediff = $now - $your_date;

                    $percentage = 0;
                    $eligibilitySumAmount += $value["amount"];

                    if (round($datediff / (60 * 60 * 24)) >= 365) {
                        $percentage = 0;
                    } else {
                        if ($totalSumRecharged >= $eligibilitySumAmount) {
                            // eligible to this subscription
                            $percentage = 100;
                        } else {
                            $percentage = 50;
                        }
                    }

                    $updatedDataArray = array(
                        "id" => $value["id"],
                        "sku_user" => $value["sku_user"],
                        "amount" => $value["amount"],
                        "package_code" => $value["package_code"],
                        "package_name" => $value->package ? $value->package->name : $value["package_code"],
                        "created_at" => $date->format("d/m/Y h:i"),
                        "paid_at" => $value["paid_at"],
                        "end_at" => $value["end_at"],
                        "status" => $percentage
                    );
                    $finalDatas[] = $updatedDataArray;
                }

                // custom return
                return response()->json(
                    [
                        'data' => $finalDatas,
                        'totalData' => count(Subscription::where($condition_array)->get()),
                        'condition' => $condition_array,
                        'message' => "Liste des elements...",
                        'code' => 200
                    ]
                );
            } else {
                // get all
                if ($user->role != "super-admin") {
                    $condition_array['sku_user'] = $user->sku_user;
                }

                $subscriptions = Subscription::with('package')->where($condition_array)->get();

                // Ajouter le nom du package à chaque souscription
                $subscriptionsWithPackageName = $subscriptions->map(function ($subscription) {
                    return [
                        'id' => $subscription->id,
                        'sku_user' => $subscription->sku_user,
                        'package_code' => $subscription->package_code,
                        'package_name' => $subscription->package ? $subscription->package->name : $subscription->package_code,
                        'amount' => $subscription->amount,
                        'status' => $subscription->status,
                        'created_at' => $subscription->created_at,
                        'updated_at' => $subscription->updated_at,
                        'paid_at' => $subscription->paid_at,
                        'end_at' => $subscription->end_at,
                    ];
                });

                return response()->json(
                    [
                        'data' => $subscriptionsWithPackageName,
                        "totalData" => count($subscriptions),
                        'message' => "Liste des elements.",
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

        /* if ($user->role == "VIP-1") {
            // condition supprimee
            return response()->json(
                [
                    'message' => "Vous n'etes pas en ordre svp, totalisez 62 parrainages et vous obtiendrais le niveau d'accès nécessaire."
                ], 400
            );
        }*/

        // block multi subscribe to a package
        /* $mySubscriptions = Subscription::where(["sku_user" => $user->sku_user, "package_code" => $request->package_code])->get();
        if (count($mySubscriptions) > 0) {
            return response()->json(
                [
                    'message' => "Vous avez déjà souscrit à ce pack"
                ],
                400
            );
        } */

        try {
            $subscription = new Subscription();
            $data = $request->all();

            if ($user->role == "super-admin") {
                $subscription->sku_user = "*";
            } else {
                $subscription->sku_user = $user->sku_user;
            }

            foreach ($data as $key => $value) {
                if (is_array($value)) {
                    // convert to json string
                    $subscription->$key = json_encode($value);
                } else {
                    if ($key != "sku_subscription" && $value != "null") {
                        $subscription->$key = $value;
                    }
                }
            }

            $packageInformation = Package::where('code', $request->package_code)->get();
            $pack_info = $packageInformation[0];

            $utils = new FunctionCollection();
            $soldes =  $utils->WalletBalance();

            // verifier si le membre a une litige
            if($soldes['show_debt_message']==true){
                return response()->json(
                    [
                        'message' => "Solder d'abord votre actuelle litige de (". $soldes['dette_restante_achat_packet'] ."$) afin d'effectuer une nouvelle souscription."
                    ],
                    400
                );
            }
            if($pack_info->amount > 0){
                // ok
            }else{
                return response()->json(
                    [
                        'message' => "Le montant doit etre >= 1 et ne doit pas etre null"
                    ],
                    400
                );
            }

            if ($pack_info != null) {

                $nouveau_solde = ($request->amount + $soldes['total_subscription_pack_actuel']);
                $dette_restante = $pack_info->amount - $soldes['total_subscription_pack_actuel'];
                $dette_restante_apres_operation = $pack_info->amount - ($soldes['total_subscription_pack_actuel'] + $request->amount);

                // si le montant de subscription est superieur au montant du pack
                if ($nouveau_solde > $pack_info->amount) {

                    /* if ($dette_restante == "0" or $dette_restante == 0) {
                        return response()->json(
                            [
                                'message' => "Vous etes déjà en ordre avec le payement du package."
                            ],
                            400
                        );
                    }

                    if ($dette_restante_apres_operation == 0) {
                        return response()->json(
                            [
                                'message' => "TEST OK"
                            ],
                            400
                        );
                    } else {
                        return response()->json(
                            [
                                'message' => "Le montant saisi (" . $request->amount . "$) est supérieur au montant à souscrire pour le package, " . $pack_info->name . "=" . $pack_info->amount . "$" . ", Il vous manque seulement " . $dette_restante . "$ à payer."
                            ],
                            400
                        );
                    } */
                } else {
                    // le montant est inférieur
                    // ok on continue
                }
            }

            try {
                //create new...
                $accountNew = Account::create([
                    'sku_user'  => $user->sku_user,
                    'amount'    => $pack_info->amount,
                    'currency'  => "USD",
                ]);
            } catch (\Throwable $th) {
                // compte existant
            }

            // enregister subscription
            $subscription->amount = $pack_info->amount;
            $subscription->status = 1;
            $subscription->save();

            // get global config
            $config = new platformConfig();

            // create parent parring bonus
            /* $accountNew = Bonus::create([
                'sku_user' => $user->sku_user_parent, // parent
                'sku_user_origin' => $user->sku_user, // child
                'amount' => ($pack_info->amount / $config->parring_bonus_percent),
                'currency' => "USD",
                'reference' => "PARRAINAGE",
                'designation' => "BONUS-PARRAINAGE",
                'origin' => $user->email,
                'status' => 0,
            ]); */

            return response()->json(
                [
                    'message' => "Enregistrement subscription effectué",
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

    public function confirm(Request $request)
    {
        try {
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

            if (!$subscription = Subscription::find($request->id)) {
                throw new NotFoundHttpException('Subscription non trouvé de ref= ' . $request->id);
            }

            // code d'activation
            $subscription->status = 1;
            $subscription->save();
            return response()->json(
                [
                    'message' => "Conformation de la subscription Effectuée.",
                    'code' => 201
                ]
            );
        } catch (HttpException $th) {
            throw $th;
        }
    }

    public function reject(Request $request, $id)
    {
        try {

            if (!$user = auth()->user()) {
                throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
            }

            if ($user->role == "super-admin") {
                // ok
            } else {
                // throw new NotFoundHttpException("Accès Réfusé; contacter l'administrateur du système svp");
                return response()->json(
                    [
                        'message' => "Accès Réfusé; contacter l'administrateur du système svp",
                    ],
                    202
                );
            }

            if (!$subscription = Subscription::find($id)) {
                throw new NotFoundHttpException('Subscription non trouvée pour la référence: ' . $id);
            }

            // code d'activation
            $subscription->status = 2;
            $subscription->save();
            return response()->json(
                [
                    'message' => "Rejet Effectué avec succès",
                    'code' => 201
                ]
            );
        } catch (HttpException $th) {
            throw $th;
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
            $subscriptionInfos = Subscription::find($id);
            // $full_destination_url = url($subscriptionInfos["image"]);
            // append image full url //
            // $subscriptionInfos['image_url'] = $full_destination_url;
            // $subscriptionInfos['modules'] = '[{"sku_subscription_parent":null,"sku_module":"module-1663742309717","name":"A propos du logiciel","route":"get-start","icon":null}]';
            return response()->json(
                [
                    'data' => $subscriptionInfos,
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
            $subscription = Subscription::find($request->id);
            $data = $request->all();
            foreach ($data as $key => $value) {
                if ($key != "sku_subscription" && $key != "sku_subscription" && $key != "created_at" && $key != "updated_at" && $key != "id" && $value != "null") {
                    if (is_array($value)) {
                        // convert to json string
                        $subscription->$key = json_encode($value);
                    } else {
                        if ($key != "sku_subscription" && $value != "null") {
                            $subscription->$key = $value;
                        }
                    }
                }
            }

            $subscription->save();
            return response()->json(
                [
                    'message' => "Mise a jour subscription effectuée",
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
            $subscription = Subscription::find($id);
            $subscription->delete();
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
