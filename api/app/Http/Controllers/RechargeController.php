<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Recharge;
use App\Models\Account;
use App\Models\Package;
use App\Models\Bonus;
use App\Http\Controllers\FunctionCollection;
use App\Models\Investor;
use App\Models\Notification;
use App\Models\User;
use Error;
use Exception;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class RechargeController extends Controller
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

            if ($user->role != "super-admin") {
                $condition_array['sku_user'] = $user->sku_user;
            }

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
                    // premiere page ->orderBy('created_at', "DESC")
                    $rechargesInfos = Recharge::where($condition_array)
                        ->orderBy($sortField, $sortMethod)->skip(0)
                        ->take($request['perPage'])
                        ->get();
                } else {
                    $rechargesInfos = Recharge::where($condition_array)
                        ->orderBy($sortField, $sortMethod)
                        ->skip(($request['page'] * $request['perPage']) - $request['perPage'])
                        ->take($request['perPage'])
                        ->get();
                }

                // custom return
                return response()->json(
                    [
                        'data' => $rechargesInfos,
                        'totalData' => count(Recharge::where($condition_array)->get()),
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
                return response()->json(
                    [
                        'data' => Recharge::where($condition_array)
                            ->orderBy($sortField, $sortMethod)
                            ->get(),
                        "totalData" => count(Recharge::where($condition_array)->get()),
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

    public function RechargeTypes(Request $request)
    {

        $rechargeTypes = array(
            ["type" => "bitcoin", "name" => "Bitcoin"],
            ["type" => "usdt", "name" => "USDT"],
            ["type" => "airtel-money", "name" => "Airtel Money"],
            ["type" => "m-pesa", "name" => "M-Pesa"],
            ["type" => "orange-money", "name" => "Orange Money"],
        );

        return response()->json(
            [
                'data' => $rechargeTypes,
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
            $recharge = new Recharge();
            $data = $request->all();

            // generate recharge sku_
            $rechargeCount = count(Recharge::all());
            $rechargeGeneratedID = "RC" . date("md") . ($rechargeCount + 1);

            // get global config
            $config = new platformConfig();

            // parent amount bonus
            $parentBonusAmount = ($config->parring_bonus_percent * $recharge->amount) / 100;

            if ($user->role == "super-admin") {
                $recharge->sku_user = "*";
            } else {
                $recharge->sku_user = $user->sku_user;
            }

            $recharge->sku_recharge = $rechargeGeneratedID;
            // $recharge->package_code = $user->role;

            foreach ($data as $key => $value) {
                if (is_array($value)) {
                    // convert to json string
                    $recharge->$key = json_encode($value);
                } else {
                    if ($key != "id" && $key != "paywithmybalance") {
                        $recharge->$key = $value;
                    }
                }
            }

            $utils = new FunctionCollection();
            $myAccountRepport = $utils->WalletBalance(null, null);

            if ($request->paywithmybalance == true) {

                $balanceCurrent = floatval($myAccountRepport['balanceAmount']);
                $amountToRecharge = floatval($request->amount);

                if ($balanceCurrent >= $amountToRecharge) {
                    // activate
                    // $recharge->status = 1;
                } else {
                    return response()->json(
                        [
                            'message' => "Votre solde (" . $myAccountRepport['balanceAmount'] . "$) est inférieur au montant de (" . $request->amount . "$) que vous voulez recharger."
                        ],
                        400
                    );
                }
            } else {
                // check if payment code exists
                $paymentCodeExists = Recharge::where(['payment_code' => $request->payment_code])->get();
                if (count($paymentCodeExists) > 0) {
                    // existing payment code
                    return response()->json(
                        [
                            'message' => 'Code/Ref./N° Payement [' . $request->payment_code . '] existe dans le système, si vous rencontrez de soucis, veuillez signaler à l\'administration'
                        ],
                        500
                    );
                }
            }

            $nouveau_solde = ($request->amount + $myAccountRepport['total_recharge_pack_actuel']);
            $dette_restante = $myAccountRepport['prix_package'] - $myAccountRepport['total_recharge_pack_actuel'];
            $dette_restante_apres_operation = $myAccountRepport['prix_package'] - ($myAccountRepport['total_recharge_pack_actuel'] + $request->amount);

            // Skip subscription validation for free recharges (wallet top-ups)
            if (!$request->is_free_recharge) {
                // si le montant de recharge est superieur au montant du pack
                if ($nouveau_solde > $myAccountRepport['prix_package']) {

                    if ($dette_restante == "0") {
                        return response()->json(
                            [
                                'message' => "Vous etes déjà en ordre avec le payement de(s) package(s)."
                            ],
                            400
                        );
                    }

                    if ($dette_restante_apres_operation == 0) {
                        return response()->json(
                            [
                                'message' => "Vous n'avez pas de dette à payer"
                            ],
                            400
                        );
                    } else {
                        $message = "Le montant saisi (" . $request->amount . "$) est supérieur au montant de souscription pour le(s) package(s), qui coute " . $myAccountRepport['total_recharge_pack_actuel'] . "$";
                        if ($myAccountRepport['total_recharge_pack_actuel'] > 0) {
                            $message = "Le montant saisi (" . $request->amount . "$) plus votre solde: " . $myAccountRepport['total_recharge_pack_actuel'] . "$ est supérieur au montant de souscription pour le(s) package(s), qui coute " . $myAccountRepport['total_recharge_pack_actuel'] . "$";
                        }

                        if ($dette_restante > 0) {
                            $message .= ", Il vous manque seulement " . $dette_restante . "$ à payer.";
                        }
                        return response()->json(
                            [
                                'message' =>  $message
                            ],
                            400
                        );
                    }
                } else {
                    // le montant est inférieur
                    // ok on continue
                }
            }

            try {
                //create new...
                $accountNew = Account::create([
                    'sku_user'  => $user->sku_user,
                    'amount'    => $request->amount,
                    'currency'  => "USD",
                ]);
            } catch (\Throwable $th) {
                // compte existant ou erreur
                \Illuminate\Support\Facades\Log::error("Erreur creation compte lors de la recharge: " . $th->getMessage());
            }

            if ($request->paywithmybalance == true) {
                // definir les valeurs
                $recharge->payment_code = "P.INT.0" . count(Recharge::all());
                $recharge->payment_method = "MON-SOLDE";
                $recharge->status = 1;

                // bonus 10%
                $bonusParraing = ((10 * $recharge->amount) / 100);

                // offir bonus direct au parrain
                $bonusInfos = Bonus::create([
                    'sku_user' => $user->sku_user_parent, // my parent // destination user
                    'sku_user_origin' => $user->sku_user, // me
                    'sku_recharge' => $recharge->sku_recharge, // recharge ID
                    'amount' => $bonusParraing,
                    'currency' => "USD",
                    'reference' => "PARRAINAGE",
                    'designation' => "BONUS-PARRAINAGE",
                    'origin' => $user->fullName, // my full name
                    'status' => 1,
                ]);
            } else {
                $recharge->status = 0;
            }

            // enregistrement
            $recharge->save();

            // user notification
            $newNotification = new Notification();
            $newNotification->sku_user = $user->sku_user;
            $newNotification->sku_notification = "NTF-0" . count(Notification::all());
            $newNotification->type = "Transaction Recharge";
            $newNotification->ref = 'cbp@cbpcommunity.com';
            $newNotification->date = date("d/m/Y");
            $newNotification->destination_name = $user->fullName;
            $newNotification->destination_description = "";
            $newNotification->destination_adress = "";
            $newNotification->destination_gender = "";
            $newNotification->header = "Transaction Recharge!";
            $newNotification->object = 'CBP Transaction Recharge!';
            $newNotification->content = 'Bonjour Cher(e) ' . $user->fullName . ", votre commande de recharge de (" . $request->amount . "$) est en cours de traitement.";
            $newNotification->description = '<p>Vous serez notifié lors de la confirmation de reception de notre part, merci pour votre confiance.</p>';
            $newNotification->email_destination = $user->email;
            $newNotification->save();

            return response()->json(
                [
                    'message' => "Enregistrement recharge effectué"
                ]
            );
        } catch (Error $er) {
            return response()->json(
                [
                    'er' => "Erreur",
                    'message' => "Erreur survenu lors de l'enregistrement",
                ],
                500
            );
        } catch (Exception $ex) {
            return response()->json(
                [
                    'ex' => "Exception",
                    'message' => "Erreur exceptionnelle survenu lors de l'enregistrement",
                ],
                500
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
                    500
                );
            }

            if (!$recharge = Recharge::find($request->id)) {
                throw new NotFoundHttpException('Recharge non trouvé de ref= ' . $request->id);
            }

            // get userData parent of the user operation
            $userDataForMemberWhoRecharged = User::where(['sku_user' => $recharge->sku_user])->first(['sku_user', 'sku_user_parent', 'fullName', 'email']);
            $rechargeParentData = User::where(['sku_user' => $userDataForMemberWhoRecharged->sku_user_parent])->first(['sku_user', 'role', 'fullName', 'email']);

            // create parent parring bonus
            // verification de l'eligibilite au bonus
            // 1 un parrain  qui a ete migre
            $childDataAsInvestor = Investor::where(['sku_user' => $userDataForMemberWhoRecharged->sku_user])->first(['type', 'stop_gain']);
            $parentDataAsInvestor = Investor::where(['sku_user' => $userDataForMemberWhoRecharged->sku_user_parent])->first(['type', 'stop_gain']);

            if ($childDataAsInvestor == null) {
                return response()->json(
                    [
                        "sku_user_inv" => $userDataForMemberWhoRecharged,
                        'message' => "Veuillez d'abord migrer le membre denommé: " . $userDataForMemberWhoRecharged->fullName . " | ayant comme email: " . $userDataForMemberWhoRecharged->email .  " en tant qu'investisseur; puis réessayer.",
                    ],
                    500
                );
            }

            // bonus 10%
            $bonusParraing = ((10 * $recharge->amount) / 100);

            if ($bonusParraing > 0) {
                // si le parrain est super-admin
                if ($parentDataAsInvestor == null) {
                    // $parentDataAsInvestor = null;
                    return response()->json(
                        [
                            'message' => "Recharge non-confirmée; le compte n'a pas de parrain.",
                        ],
                        202
                    );

                }
                elseif($rechargeParentData->role == "super-admin"){
                    // confirm recharge
                    $recharge->status = 1;
                    $recharge->save();

                    return response()->json(
                        [
                            'message' => "Recharge confirmée; le parrain est super-admin, pas de bonus.",
                        ],
                        201
                    );
                }
                else {
                    if ($parentDataAsInvestor->type == "Migré" and $childDataAsInvestor->type == "Migré") {
                        // si le parain et l'invite ont tous été migré, pas de bonus

                        // confirm recharge
                            $recharge->status = 1;
                            $recharge->save();

                            // message vers investisseur demandeur de recharge
                            $newNotification = new Notification();
                            $newNotification->sku_user = $userDataForMemberWhoRecharged->sku_user;
                            $newNotification->sku_notification = "NTF-0" . count(Notification::all());
                            $newNotification->type = "Transaction Recharge";
                            $newNotification->ref = 'cbp@cbpcommunity.com';
                            $newNotification->date = date("d/m/Y");
                            $newNotification->destination_name = $userDataForMemberWhoRecharged->fullName;
                            $newNotification->destination_description = "";
                            $newNotification->destination_adress = "";
                            $newNotification->destination_gender = "";
                            $newNotification->header = "CBP Recharge";
                            $newNotification->object = 'CBP Confirmation Recharge!';
                            $newNotification->content = 'Bonjour Cher(e) ' . $userDataForMemberWhoRecharged->fullName . ", votre recharge a été confirmée, merci pour votre fidélité";
                            $newNotification->description = '<p>Vous serez notifié lors de la confirmation de reception de notre part, merci pour votre confiance.</p>';
                            $newNotification->email_destination = $userDataForMemberWhoRecharged->email;
                            $newNotification->save();


                        return response()->json(
                            [
                                'message' => "Confirmation de la recharge Effectuée.",
                            ],
                            201
                        );

                    } else {

                        if (!$bonusExists = Bonus::where("sku_recharge", $recharge->sku_recharge)->first()) {
                            // throw new NotFoundHttpException('Recharge non trouvé de ref= ' . $request->id);
                        }

                        if ($bonusExists != null) {
                            // bonus deja offert
                            // confirm recharge
                            $recharge->status = 1;
                            $recharge->save();

                            return response()->json(
                                [
                                    'message' => "Confirmation de la recharge et (Bonus)",
                                ],
                                201
                            );
                        } else {

                            // offir bonus au parrain apres confirmation/validation par l'admin
                            $bonusInfos = Bonus::create([
                                'sku_user' => $rechargeParentData->sku_user, // parent
                                'sku_user_origin' => $userDataForMemberWhoRecharged->sku_user, // child
                                'sku_recharge' => $recharge->sku_recharge, // recharge ID
                                'amount' => $bonusParraing,
                                'currency' => "USD",
                                'reference' => "PARRAINAGE",
                                'designation' => "BONUS-PARRAINAGE",
                                'origin' => $userDataForMemberWhoRecharged->fullName,
                                'status' => 1,
                            ]);

                            // confirm recharge
                            $recharge->status = 1;
                            $recharge->save();
                        }

                        // message vers parrain
                        $newNotification = new Notification();
                        $newNotification->sku_user = $rechargeParentData->sku_user;
                        $newNotification->sku_notification = "NTF-0" . count(Notification::all());
                        $newNotification->type = "Transaction Recharge";
                        $newNotification->ref = 'cbp@cbpcommunity.com';
                        $newNotification->date = date("d/m/Y");
                        $newNotification->destination_name = $rechargeParentData->fullName;
                        $newNotification->destination_description = "";
                        $newNotification->destination_adress = "";
                        $newNotification->destination_gender = "";
                        $newNotification->header = "CBP Parrainage";
                        $newNotification->object = 'CBP Bonus Parrainage!';
                        $newNotification->content = 'Bonjour Cher(e) ' . $rechargeParentData->fullName . ", vous avez réçue (" . (10 * $recharge->amount) / 100  . "$) pour la recharge de " . $userDataForMemberWhoRecharged->fullName . ", merci pour votre fidélité";
                        $newNotification->description = '<p>Vous serez notifié lors de la confirmation de reception de notre part, merci pour votre confiance.</p>';
                        $newNotification->email_destination = $rechargeParentData->email;
                        $newNotification->save();

                        if ($rechargeParentData->role == "super-admin") {
                            // si le parrain est super-admin
                            // message vers administration
                            $newNotification = new Notification();
                            $newNotification->sku_user = $user->sku_user;
                            $newNotification->sku_notification = "NTF-0" . count(Notification::all());
                            $newNotification->type = "Transaction Recharge";
                            $newNotification->ref = 'cbp@cbpcommunity.com';
                            $newNotification->date = date("d/m/Y");
                            $newNotification->destination_name = $user->fullName;
                            $newNotification->destination_description = "";
                            $newNotification->destination_adress = "";
                            $newNotification->destination_gender = "";
                            $newNotification->header = "Recharge Confirmée";
                            $newNotification->object = 'CBP Confirmation Recharge!';
                            $newNotification->content = 'Gain Systeme de Parrainage' . ", reception de (" . $bonusParraing . "$) pour la recharge de " . $userDataForMemberWhoRecharged->fullName;
                            $newNotification->description = '<p>Vous serez notifié lors de la confirmation de reception de notre part, merci pour votre confiance.</p>';
                            $newNotification->email_destination = $user->email;
                            $newNotification->save();
                        } else {
                            // message vers investisseur demandeur de recharge
                            $newNotification = new Notification();
                            $newNotification->sku_user = $userDataForMemberWhoRecharged->sku_user;
                            $newNotification->sku_notification = "NTF-0" . count(Notification::all());
                            $newNotification->type = "Transaction Recharge";
                            $newNotification->ref = 'cbp@cbpcommunity.com';
                            $newNotification->date = date("d/m/Y");
                            $newNotification->destination_name = $userDataForMemberWhoRecharged->fullName;
                            $newNotification->destination_description = "";
                            $newNotification->destination_adress = "";
                            $newNotification->destination_gender = "";
                            $newNotification->header = "CBP Recharge";
                            $newNotification->object = 'CBP Confirmation Recharge!';
                            $newNotification->content = 'Bonjour Cher(e) ' . $userDataForMemberWhoRecharged->fullName . ", votre recharge a été confirmée, merci pour votre fidélité";
                            $newNotification->description = '<p>Vous serez notifié lors de la confirmation de reception de notre part, merci pour votre confiance.</p>';
                            $newNotification->email_destination = $userDataForMemberWhoRecharged->email;
                            $newNotification->save();
                        }

                        return response()->json(
                            [
                                'message' => "Confirmation de la recharge Effectuée.",
                            ],
                            201
                        );
                    }
                }
            } else {
                //  operation contenant erreur
                if ($bonusParraing <= 0) {
                    return response()->json(
                        [
                            'message' => "Erreur système interne. Veuillez contacter l'admin",
                        ],
                        500
                    );
                }else{
                    return response()->json(
                        [
                            'message' => "Erreur système. Veuillez contacter l'admin",
                        ],
                        500
                    );
                }
            }
        } catch (Error $e) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de la confirmation",
                    'error' => "Exx52",
                ],
                500
            );
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

            if (!$recharge = Recharge::find($id)) {
                throw new NotFoundHttpException('Recharge non trouvée pour la référence: ' . $id);
            }

            // get userData parent of the user operation
            $userDataForMemberWhoRecharged = User::where(['sku_user' => $recharge->sku_user])->first(['sku_user', 'fullName', 'email']);

            // code d'activation
            $recharge->status = 2;
            $recharge->save();

            // message vers investisseur demandeur de recharge
            $newNotification = new Notification();
            $newNotification->sku_user = $userDataForMemberWhoRecharged->sku_user;
            $newNotification->sku_notification = "NTF-0" . count(Notification::all());
            $newNotification->type = "Rejet de la Recharge";
            $newNotification->ref = 'cbp@cbpcommunity.com';
            $newNotification->date = date("d/m/Y");
            $newNotification->destination_name = $userDataForMemberWhoRecharged->fullName;
            $newNotification->destination_description = "";
            $newNotification->destination_adress = "";
            $newNotification->destination_gender = "";
            $newNotification->header = "CBP Rejet de la Recharge";
            $newNotification->object = 'CBP Rejet de la Recharge!';
            $newNotification->content = 'Bonjour Cher(e) ' . $userDataForMemberWhoRecharged->fullName . ", votre commande de recharge de (" . $request->amount . "$) a été régetée par manque de conformité.";
            $newNotification->description = '<p>Veuillez revérifier votre code/n° de référence de payement puis réessayer ou nous contacter, merci pour votre confiance.</p>';
            $newNotification->email_destination = $userDataForMemberWhoRecharged->email;
            $newNotification->save();

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
            $rechargeInfos = Recharge::find($id);
            // $full_destination_url = url($rechargeInfos["image"]);
            // append image full url //
            // $rechargeInfos['image_url'] = $full_destination_url;
            // $rechargeInfos['modules'] = '[{"sku_recharge_parent":null,"sku_module":"module-1663742309717","name":"A propos du logiciel","route":"get-start","icon":null}]';
            return response()->json(
                [
                    'data' => $rechargeInfos,
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
            $recharge = Recharge::find($request->id);
            $data = $request->all();
            foreach ($data as $key => $value) {
                if ($key != "sku_recharge" && $key != "sku_recharge" && $key != "created_at" && $key != "updated_at" && $key != "id" && $value != "null") {
                    if (is_array($value)) {
                        // convert to json string
                        $recharge->$key = json_encode($value);
                    } else {
                        if ($key != "sku_recharge" && $value != "null") {
                            $recharge->$key = $value;
                        }
                    }
                }
            }

            $recharge->save();
            return response()->json(
                [
                    'message' => "Mise a jour recharge effectuée",
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
            $recharge = Recharge::find($id);
            $recharge->delete();
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
