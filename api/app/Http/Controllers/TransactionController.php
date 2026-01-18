<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\Account;
use App\Models\Package;
use App\Models\User;
use App\Http\Controllers\FunctionCollection;
use App\Http\Controllers\platformConfig;
use App\Models\Investor;
use App\Models\Notification;
use App\Models\Recharge;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;


class TransactionController extends Controller
{

    public function TransactionTypes(Request $request)
    {

        $transactionTypes = array(
            ["type" => "bitcoin", "name" => "Bitcoin"],
            ["type" => "usdt", "name" => "USDT"],
            ["type" => "airtel-money", "name" => "Airtel Money"],
            ["type" => "m-pesa", "name" => "M-Pesa"],
            ["type" => "orange-money", "name" => "Orange Money"],
        );

        return response()->json(
            [
                'data' => $transactionTypes,
                'message' => "Liste des elements",
                'code' => 200
            ]
        );
    }

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
                    $transactionsInfos = Transaction::where($condition_array)
                        ->orderBy($sortField, $sortMethod)->skip(0)
                        ->take($request['perPage'])
                        ->get();
                } else {
                    $transactionsInfos = Transaction::where($condition_array)
                        ->orderBy($sortField, $sortMethod)
                        ->skip(($request['page'] * $request['perPage']) - $request['perPage'])
                        ->take($request['perPage'])
                        ->get();
                }

                // custom return
                return response()->json(
                    [
                        'data' => $transactionsInfos,
                        "totalData" => count(Transaction::where($condition_array)->get()),
                        'message' => "Liste des elements",
                        'code' => 200
                    ]
                );
            } else {
                // get all
                $condition_array = ['status' => null];
                if ($user->role != "super-admin") {
                    $condition_array['sku_user'] = $user->sku_user;
                }
                return json_encode(Transaction::where($condition_array)
                    ->orderBy($sortField, $sortMethod)
                    ->get());
            }
        } catch (\Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de recuperation des données",
                    'code' => 500
                ]
            );
        }
    }

    public function indexCashRequest(Request $request)
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
            $condition_array["type"] = "RETRAIT";
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
                    // premiere page
                    $transactionsInfos = Transaction::where($condition_array)
                        ->orderBy($sortField, $sortMethod)->skip(0)
                        ->take($request['perPage'])
                        ->get();
                } else {
                    $transactionsInfos = Transaction::where($condition_array)
                        ->orderBy($sortField, $sortMethod)
                        ->skip(($request['page'] * $request['perPage']) - $request['perPage'])
                        ->take($request['perPage'])
                        ->get();
                }

                // custom return
                return response()->json(
                    [
                        'data' => $transactionsInfos,
                        "totalData" => count(Transaction::where($condition_array)->get()),
                        'message' => "Liste des elements",
                        'code' => 200
                    ]
                );
            } else {
                // get all
                return response()->json([
                    'data' => Transaction::where($condition_array)
                        ->orderBy($sortField, $sortMethod)
                        ->get(),
                    'message' => "Liste des elements",
                    'code' => 200
                ]);
            }
        } catch (\Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de recuperation des données",
                    'code' => 500
                ]
            );
        }
    }

    public function indexTransfertRequest(Request $request)
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
            $condition_array["type"] = "TRANSFERT";

            // Check for impersonation header
            $effectiveUserSku = $user->sku_user;
            $effectiveRole = $user->role;

            if ($request->header('X-Impersonate-User')) {
                $impersonatedSku = $request->header('X-Impersonate-User');
                // Verify the impersonated user exists
                $impersonatedUser = User::where('sku_user', $impersonatedSku)->first();
                if ($impersonatedUser) {
                    $effectiveUserSku = $impersonatedUser->sku_user;
                    $effectiveRole = $impersonatedUser->role;
                }
            }

            if ($effectiveRole != "super-admin") {
                $condition_array['sku_user'] = $effectiveUserSku;
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
                // Build base query
                $query = Transaction::with(['user', 'destinationUser'])
                    ->where('type', 'TRANSFERT');

                // For non-admin, filter to show only user's transactions
                if ($effectiveRole != "super-admin") {
                    $query->where(function($q) use ($effectiveUserSku) {
                        $q->where('sku_user', $effectiveUserSku)
                          ->orWhere('sku_user_destination', $effectiveUserSku);
                    });
                }

                // Apply sorting and pagination
                if ($request['page'] == 1) {
                    $transactionsInfos = $query
                        ->orderBy($sortField, $sortMethod)
                        ->skip(0)
                        ->take($request['perPage'])
                        ->get();
                } else {
                    $transactionsInfos = $query
                        ->orderBy($sortField, $sortMethod)
                        ->skip(($request['page'] * $request['perPage']) - $request['perPage'])
                        ->take($request['perPage'])
                        ->get();
                }

                // Get total count with same filters
                $totalQuery = Transaction::where('type', 'TRANSFERT');
                if ($effectiveRole != "super-admin") {
                    $totalQuery->where(function($q) use ($effectiveUserSku) {
                        $q->where('sku_user', $effectiveUserSku)
                          ->orWhere('sku_user_destination', $effectiveUserSku);
                    });
                }

                // custom return
                return response()->json(
                    [
                        'data' => $transactionsInfos,
                        "totalData" => $totalQuery->count(),
                        'message' => "Liste des elements",
                        'code' => 200
                    ]
                );

            } else {
                // get all - for non-admin, show only transactions where user is sender OR receiver
                $query = Transaction::with(['user', 'destinationUser'])
                    ->where('type', 'TRANSFERT');

                if ($effectiveRole != "super-admin") {
                    $query->where(function($q) use ($effectiveUserSku) {
                        $q->where('sku_user', $effectiveUserSku)
                          ->orWhere('sku_user_destination', $effectiveUserSku);
                    });
                }

                return response()->json([
                    'data' => $query->orderBy($sortField, $sortMethod)->get(),
                    'message' => "Liste des elements",
                    'code' => 200
                ]);
            }
        } catch (\Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de recuperation des données",
                    'code' => 500
                ]
            );
        }
    }

    public function indexCoinRequest(Request $request)
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

            // type filter
            $condition_array["type"] = "ACHAT-CRYPTO";

            // get all
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
                    $transactionsInfos = Transaction::where($condition_array)
                        ->orderBy($sortField, $sortMethod)->skip(0)
                        ->take($request['perPage'])
                        ->get();
                } else {
                    $transactionsInfos = Transaction::where($condition_array)
                        ->orderBy($sortField, $sortMethod)
                        ->skip(($request['page'] * $request['perPage']) - $request['perPage'])
                        ->take($request['perPage'])
                        ->get();
                }

                // get all
                if ($user->role != "super-admin") {
                    return response()->json(
                        [
                            'data' => $transactionsInfos,
                            "totalData" => count($transactionsInfos),
                            'message' => "Liste des elements",
                            'code' => 200
                        ]
                    );
                } else {
                    // super admin
                    return response()->json(
                        [
                            'data' => $transactionsInfos,
                            "totalData" => count(Transaction::where($condition_array)
                                ->orderBy($sortField, $sortMethod)
                                ->get()),
                            'message' => "Liste des elements",
                            'code' => 200
                        ]
                    );
                }
            } else {
                // get all
                if ($user->role != "super-admin") {
                    $condition_array['sku_user'] = $user->sku_user;
                }

                if ($user->role != "super-admin") {
                    $condition_array['sku_user'] = $user->sku_user;
                    return response()->json(
                        [
                            'data' => Transaction::where($condition_array)
                                ->orderBy($sortField, $sortMethod)
                                ->get(),
                            "totalData" => count(Transaction::where($condition_array)->get()),
                            'message' => "Liste des elements",
                            'code' => 200
                        ]
                    );
                } else {
                    // super admin
                    return response()->json(
                        [
                            'data' => Transaction::where($condition_array)
                                ->orderBy($sortField, $sortMethod)
                                ->get(),
                            "totalData" => count(Transaction::where($condition_array)->get()),
                            'message' => "Liste des elements",
                            'code' => 200
                        ]
                    );
                }
            }
        } catch (\Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de recuperation des données",
                    'code' => 500
                ]
            );
        }
    }

    public function indexCoinSaleRequest(Request $request)
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
            $condition_array["type"] = "VENTE-CRYPTO";
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
                    // premiere page
                    $transactionsInfos = Transaction::where($condition_array)
                        ->orderBy($sortField, $sortMethod)->skip(0)
                        ->take($request['perPage'])
                        ->get();
                } else {
                    $transactionsInfos = Transaction::where($condition_array)
                        ->orderBy($sortField, $sortMethod)
                        ->skip(($request['page'] * $request['perPage']) - $request['perPage'])
                        ->take($request['perPage'])
                        ->get();
                }

                // custom return
                return response()->json(
                    [
                        'data' => $transactionsInfos,
                        "totalData" => count(Transaction::where($condition_array)->get()),
                        'message' => "Liste des elements",
                        'code' => 200
                    ]
                );
            } else {
                // get all
                if ($user->role != "super-admin") {
                    return response()->json(
                        [
                            'data' => Transaction::where($condition_array)
                                ->orderBy($sortField, $sortMethod)
                                ->get(),
                            "totalData" => count(Transaction::where($condition_array)->get()),
                            'message' => "Liste des elements",
                            'code' => 200
                        ]
                    );
                } else {
                    // super admin
                    return response()->json(
                        [
                            'data' => Transaction::where($condition_array)
                                ->orderBy($sortField, $sortMethod)
                                ->get(),
                            "totalData" => count(Transaction::where($condition_array)->get()),
                            'message' => "Liste des elements",
                            'code' => 200
                        ]
                    );
                }
            }
        } catch (\Exception $ex) {
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

        try {
            $transaction = new Transaction();
            $data = $request->all();

            if ($user->role == "super-admin") {
                $transaction->sku_user = "*";
            } else {
                $transaction->sku_user = $user->sku_user;
            }

            foreach ($data as $key => $value) {
                if (is_array($value)) {
                    // convert to json string
                    $transaction->$key = json_encode($value);
                } else {
                    if ($key != "sku_transaction" && $value != "null") {
                        $transaction->$key = $value;
                    }
                }
            }

            /* $packageInformation = Package::where('code', $user->role)->get();
            $pack_info = $packageInformation[0]; */

            $utils = new FunctionCollection();
            $soldes =  $utils->WalletBalance();

            $nouveau_solde = ($request->amount + $soldes['total_transaction']);
            $dette_restante = $soldes['dette_restante_achat_packet_nonformatee'] - $soldes['total_transaction'];
            $dette_restante_apres_operation = $soldes['dette_restante_achat_packet_nonformatee'] - ($soldes['total_transaction'] + $request->amount);

            // si le montant de transaction est superieur au montant du pack
            if ($nouveau_solde > $soldes['dette_restante_achat_packet_nonformatee']) {

                if ($dette_restante == "0") {
                    return response()->json(
                        [
                            'message' => "Vous etes déjà en ordre avec le payement du package."
                        ],
                        400
                    );
                }

                if ($dette_restante_apres_operation == 0) {
                     // Dette soldée, on continue
                } else {
                    return response()->json(
                        [
                            'message' =>  $dette_restante_apres_operation . "Le montant saisi est supérieur au montant à souscrire pour le(s) package(s) est de " . $soldes['dette_restante_achat_packet_nonformatee'] . "$" . ", Il vous manque " . $dette_restante . "$ à payer."
                        ],
                        400
                    );
                }
            } else {
                // le montant est inférieur
                // ok on continue
            }

            try {
                //create new...
                $accountNew = Account::create([
                    'sku_user'  => $user->sku_user,
                    'amount'    => $request->amount,
                    'currency'  => "USD",
                ]);
            } catch (\Throwable $th) {
                // compte existant
            }

            // enregister transaction
            $transaction->save();

            return response()->json(
                [
                    'message' => "Enregistrement transaction effectué",
                    'code' => 200
                ]
            );
        } catch (\Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de l'enregistrement",
                    'code' => 500
                ]
            );
        }
    }

    public function storeCashRequest(Request $request)
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

            $transaction = new Transaction();
            $data = $request->all();

            if ($user->role == "super-admin") {
                $transaction->sku_user = "*";
            } else {
                $transaction->sku_user = $user->sku_user;
            }

            foreach ($data as $key => $value) {
                if (is_array($value)) {
                    // convert to json string
                    $transaction->$key = json_encode($value);
                } else {
                    if ($key != "sku_cash" && $value != "null" && $key != "wallet_id") {
                        $transaction->$key = $value;
                    }
                }
            }

            if (isset($request->wallet_id)) {
                $transaction->meta = json_encode(['wallet_id' => $request->wallet_id]);
            }

            // check
            $config = new platformConfig();

            if ($request->amount < $config->minimun_cash_request) {
                return response()->json(
                    [
                        'message' => "Le montant minimum de retrait est de " . $config->minimun_cash_request . "$"
                    ],
                    400
                );
            }

            $utils = new FunctionCollection();
            $soldes =  $utils->WalletBalance();

            /* $transaction_fee_percent = 10; // 10%
            $requested_amount = $request->amount;
            $transaction_fee = ($request->amount/100)*$transaction_fee_percent;
            $requested_amount_plus_fees = $requested_amount+$transaction_fee; */

            // verification
            $five_percent = (5 / 100) * $request->amount;

            if ($soldes['balanceAmount'] < ($request->amount + $five_percent)) {
                return response()->json(
                    [
                        'message' => "Votre solde (" . $soldes['wallet_balance'] . "$) est insuffisant pour couvrir le montant demandé (" . $request->amount . "$) et les " . $config->withdrawal_bonus_cost_percent . "% de frais (" . $five_percent . "$)."
                    ],
                    400
                );
            } else {
                // enregister transaction
                $transaction->type = "RETRAIT";
                $transaction->save();

                // ops investor parent message
                /* \Illuminate\Support\Facades\Mail::send([], [], function (\Illuminate\Mail\Message $message) use ($user, $request) {
                    $message
                        ->from('cbp@cbpcommunity.com')
                        ->to($user->email)
                        ->subject('CBP Confirmation Recharge!')
                        ->text('Bonjour Cher(e) ' . $user->fullName . ", votre demande de retrait de (" . $request->amount . "$) a été bien réçu")
                        ->html('<p>Vous serez notifié lors de la confirmation</p>');
                }); */

                // message vers demandeur
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
                $newNotification->header = "CBP Recharge";
                $newNotification->object = 'CBP Recharge!';
                $newNotification->content = 'Bonjour Cher(e) ' . $user->fullName . ", votre demande de retrait de (" . $request->amount . "$) a été bien réçu";
                $newNotification->description = '<p>Vous serez notifié lors de la confirmation</p>';
                $newNotification->email_destination = $user->email;
                $newNotification->save();

                return response()->json(
                    [
                        'message' => "Demande de retrait enregistrée",
                        'code' => 200
                    ]
                );
            }
        } catch (\Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de l'enregistrement",
                    'code' => 500
                ]
            );
        }
    }

    public function confirmCashRequest(Request $request)
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

            if (!$transaction = Transaction::find($request->id)) {
                throw new NotFoundHttpException('Demande de retrait non trouvé de ref= ' . $request->id);
            }

            // verification
            $five_percent = (5 / 100) * $transaction->amount;

            //create new...
            $intestorCount = count(Investor::all());
            $transactionGeneratedID = "TGS" . date("m") . ($intestorCount + 5000 + 1);
            $transactionNew = new Transaction();
            $transactionNew->sku_transaction =  $transactionGeneratedID;
            $transactionNew->sku_user = $transaction->sku_user; // member
            $transactionNew->sku_user_destination =  "*"; // system admin
            $transactionNew->type = "FRAIS-RETRAIT";
            $transactionNew->payment_method = "*";
            $transactionNew->name = "RETRAIT";
            $transactionNew->description =  $transaction->sku_transaction; // Code retrait
            $transactionNew->amount = $five_percent;
            $transactionNew->currency = "USD";
            $transactionNew->payment_code  = "Automatique";
            $transactionNew->status = 1;
            $transactionNew->save();

            // code d'activation
            $transaction->status = 1;
            $transaction->save();

            // user email
            /*  \Illuminate\Support\Facades\Mail::send([], [], function (\Illuminate\Mail\Message $message) use ($user, $transactionNew) {
                $message
                    ->from('cbp@cbpcommunity.com')
                    ->to($user->email)
                    ->subject('CBP Confirmation Recharge!')
                    ->text('Bonjour Cher(e) ' . $user->fullName . ", Demande de retrait de " . $transactionNew->amount . "$ Effectuée")
                    ->html('<p>Merci de nous faire confiance</p>');
            }); */

            // message vers demandeur
            $transactionUserData = User::where(['sku_user' => $transaction->sku_user])->first(['sku_user', 'sku_user_parent', 'fullName', 'email']);
            // infos demandeur
            $newNotification = new Notification();
            $newNotification->sku_user = $transactionUserData->sku_user;
            $newNotification->sku_notification = "NTF-0" . count(Notification::all());
            $newNotification->type = "Retrait";
            $newNotification->ref = 'cbp@cbpcommunity.com';
            $newNotification->date = date("d/m/Y");
            $newNotification->destination_name = $transactionUserData->fullName;
            $newNotification->destination_description = "";
            $newNotification->destination_adress = "";
            $newNotification->destination_gender = "";
            $newNotification->header = "CBP Confirmation Retrait!";
            $newNotification->object = 'CBP Confirmation Retrait!';
            $newNotification->content = 'Bonjour Cher(e) ' . $transactionUserData->fullName . ", Votre retrait de " . $transactionNew->amount . "$ a été effectué";
            $newNotification->description = '<p>Merci de nous faire confiance</p>';
            $newNotification->email_destination = $transactionUserData->email;
            $newNotification->save();

            return response()->json(
                [
                    'message' => "Confirmation de la Demande de retrait Effectuée.",
                    'code' => 201
                ]
            );
        } catch (HttpException $th) {
            throw $th;
        }
    }
    public function rejectCashRequest(Request $request, $id)
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

            if (!$transaction = Transaction::find($id)) {
                throw new NotFoundHttpException('Demande de retrait non trouvée pour la référence: ' . $id);
            }

            // code d'activation
            $transaction->status = 2;
            $transaction->save();

            // message vers demandeur
            $transactionUserData = User::where(['sku_user' => $transaction->sku_user])->first(['sku_user', 'sku_user_parent', 'fullName', 'email']);
            // infos demandeur
            $newNotification = new Notification();
            $newNotification->sku_user = $transactionUserData->sku_user;
            $newNotification->sku_notification = "NTF-0" . count(Notification::all());
            $newNotification->type = "Retrait";
            $newNotification->ref = 'cbp@cbpcommunity.com';
            $newNotification->date = date("d/m/Y");
            $newNotification->destination_name = $transactionUserData->fullName;
            $newNotification->destination_description = "";
            $newNotification->destination_adress = "";
            $newNotification->destination_gender = "";
            $newNotification->header = "CBP Rejet de Retrait!";
            $newNotification->object = 'CBP Rejet de Retrait!';
            $newNotification->content = 'Bonjour Cher(e) ' . $transactionUserData->fullName . ", Votre retrait de " . $transaction->amount . "$ a été réjeté";
            $newNotification->description = '<p>Vérifier vos informations puis réessayer svp.</p>';
            $newNotification->email_destination = $transactionUserData->email;
            $newNotification->save();

            return response()->json(
                [
                    'message' => "Rejet de la Demande de retrait Effectué avec succès",
                    'code' => 201
                ]
            );
        } catch (HttpException $th) {
            throw $th;
        }
    }

    public function showCashRequest($id)
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
            $transactionInfos = Transaction::find($id);
            // $full_destination_url = url($transactionInfos["image"]);
            // append image full url //
            // $transactionInfos['image_url'] = $full_destination_url;
            // $transactionInfos['modules'] = '[{"sku_transaction_parent":null,"sku_module":"module-1663742309717","name":"A propos du logiciel","route":"get-start","icon":null}]';
            return response()->json(
                [
                    'data' => $transactionInfos,
                    'message' => "Information de l'element",
                    'code' => 200
                ]
            );
        } catch (\Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de recuperation des informations de l'element",
                    'code' => 500
                ]
            );
        }
    }

    public function storeTransfertRequest(Request $request)
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

            $transaction = new Transaction();
            $data = $request->all();

            if ($user->role == "super-admin") {
                $transaction->sku_user = "*";
            } else {
                $transaction->sku_user = $user->sku_user;
            }

            // Map recipient_sku to sku_user_destination if present
            if (isset($request->recipient_sku) && !isset($request->sku_user_destination)) {
                $request->merge(['sku_user_destination' => $request->recipient_sku]);
            }

            //search
            $search_response = User::where(["email" => $request->sku_user_destination])->get()->toArray();
            if (count($search_response) <= 0) {
                return response()->json(
                    [
                        'message' => "Le bénéficiaire/membre/email: " . $request->sku_user_destination . ", n'existe pas dans le système",
                    ],
                    500
                );
            }

            // check email: sku_user_destination
            if ($user->sku_user == $request->sku_user_destination) {
                return response()->json(
                    [
                        'message' => "Tu ne peut pas te transferer toi meme tes propres fonds",
                    ],
                    500
                );
            }

            foreach ($data as $key => $value) {
                if (is_array($value)) {
                    // convert to json string
                    $transaction->$key = json_encode($value);
                } else {
                    if ($key != "sku_transaction" && $value != "null") {
                        $transaction->$key = $value;
                    }
                }
            }

            // check
            $config = new platformConfig();

            // si le montant a transferer est inferieur au montant minimum tranferable
            if (floatval($request->amount) < $config->minimun_tranfert_amount) {
                return response()->json(
                    [
                        'message' => "Le montant minimum transferable est de " . $config->minimun_tranfert_amount . "$"
                    ],
                    400
                );
            }

            $utils = new FunctionCollection();
            $soldes =  $utils->WalletBalance();

            if (floatval($request->amount) > floatval($soldes['balanceAmount'])) {
                return response()->json(
                    [
                        'message' => "Votre solde (" . $soldes['wallet_balance'] . "$) est inférieur au montant à envoyer. Parrainez et gagner plus d'argent. "
                    ],
                    400
                );
            } else {

                // enregister transaction
                $transaction->type = "TRANSFERT";
                $transaction->sku_user_destination = $search_response[0]['sku_user']; // user code
                $transaction->status = 1;
                $transaction->save();

                // ops investor parent message
                /* \Illuminate\Support\Facades\Mail::send([], [], function (\Illuminate\Mail\Message $message) use ($user, $request) {
                    $message
                        ->from('cbp@cbpcommunity.com')
                        ->to($user->email)
                        ->subject('CBP Confirmation Transfert!')
                        ->text('Bonjour Cher(e) ' . $user->fullName . ", votre opération de transfert de (" . $request->amount . "$) vers " . $request->sku_destination . " a été bien effectuée")
                        ->html('<p>Merci de nous faire confiance</p>');
                }); */

                $newNotification = new Notification();
                $newNotification->sku_user = $user->sku_user;
                $newNotification->sku_notification = "NTF-0" . count(Notification::all());
                $newNotification->type = "Transfert";
                $newNotification->ref = 'cbp@cbpcommunity.com';
                $newNotification->date = date("d/m/Y");
                $newNotification->destination_name = $user->fullName;
                $newNotification->destination_description = "";
                $newNotification->destination_adress = "";
                $newNotification->destination_gender = "";
                $newNotification->header = "CBP Confirmation Transfert!";
                $newNotification->object = 'CBP Confirmation Transfert!';
                $newNotification->content = 'Bonjour Cher(e) ' . $user->fullName . ", votre opération de transfert de (" . $request->amount . "$) vers " . $search_response[0]['fullName'] . " a été bien effectuée";
                $newNotification->description = '<p>Merci de nous faire confiance</p>';
                $newNotification->email_destination = $user->email;
                $newNotification->save();

                return response()->json(
                    [
                        'message' => "Transfert de " . $request->amount . "$ vers " . $search_response[0]['fullName'] . " effectué avec succèss",
                        'code' => 200
                    ]
                );
            }
        } catch (\Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de l'enregistrement",
                    'code' => 500
                ]
            );
        }
    }

    public function storeCoinSaleRequest(Request $request)
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

            $transaction = new Transaction();
            $data = $request->all();

            if ($user->role == "super-admin") {
                $transaction->sku_user = "*";
            } else {
                $transaction->sku_user = $user->sku_user;
            }

            foreach ($data as $key => $value) {
                if (is_array($value)) {
                    // convert to json string
                    $transaction->$key = json_encode($value);
                } else {
                    if ($key != "sku_transaction" && $value != "null") {
                        $transaction->$key = $value;
                    }
                }
            }

            // check
            $config = new platformConfig();

            if ($request->amount < $config->minimun_cash_request) {
                return response()->json(
                    [
                        'message' => "Le montant minimum de vente est de " . $config->minimun_cash_request . "$"
                    ],
                    400
                );
            }

            // enregister transaction
            $transaction->type = "VENTE-CRYPTO";
            $transaction->save();

            // user message
            /* \Illuminate\Support\Facades\Mail::send([], [], function (\Illuminate\Mail\Message $message) use ($user, $request) {
                $message
                    ->from('cbp@cbpcommunity.com')
                    ->to($user->email)
                    ->subject('CBP Confirmation Recharge!')
                    ->text("Bonjour Cher(e) " . $user->fullName . ", votre demande de vente des cryptos a été bien enregistrée")
                    ->html('<p>Vous serez notifié lors de la confirmation</p>');
            }); */

            $newNotification = new Notification();
            $newNotification->sku_user = $user->sku_user;
            $newNotification->sku_notification = "NTF-0" . count(Notification::all());
            $newNotification->type = "Vente Crypto";
            $newNotification->ref = 'cbp@cbpcommunity.com';
            $newNotification->date = date("d/m/Y");
            $newNotification->destination_name = $user->fullName;
            $newNotification->destination_description = "";
            $newNotification->destination_adress = "";
            $newNotification->destination_gender = "";
            $newNotification->header = "CBP Vente Crypto!";
            $newNotification->object = 'CBP Vente Crypto!';
            $newNotification->content = "Bonjour Cher(e) " . $user->fullName . ", votre demande de vente des cryptos a été bien enregistrée";
            $newNotification->description = '<p>Vous serez notifié lors de la confirmation</p>';
            $newNotification->email_destination = $user->email;
            $newNotification->save();

            return response()->json(
                [
                    'message' => "Vente des cryptos de " . $request->amount . "$ pour: " . $request->amount_to_receive . "$ effectuée avec succèss",
                    'code' => 200
                ]
            );
        } catch (\Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de l'enregistrement",
                    'code' => 500
                ]
            );
        }
    }

    public function storeCoinRequest(Request $request)
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

            $transaction = new Transaction();
            $data = $request->all();

            if ($user->role == "super-admin") {
                $transaction->sku_user = "*";
            } else {
                $transaction->sku_user = $user->sku_user;
            }

            foreach ($data as $key => $value) {
                if (is_array($value)) {
                    // convert to json string
                    $transaction->$key = json_encode($value);
                } else {
                    if ($key != "sku_transaction" && $value != "null") {
                        $transaction->$key = $value;
                    }
                }
            }

            // check
            // $config = new platformConfig();

            /*  if ($request->amount < $config->minimun_cash_request) {
                return response()->json(
                    [
                        'message' => "Le montant minimum transferable est de ".$config->minimun_cash_request."$"
                    ],
                    400
                );
            } */

            // enregister transaction
            $transaction->type = "ACHAT-CRYPTO";
            $transaction->save();

            // user email
            /* \Illuminate\Support\Facades\Mail::send([], [], function (\Illuminate\Mail\Message $message) use ($user) {
                $message
                    ->from('cbp@cbpcommunity.com')
                    ->to($user->email)
                    ->subject('CBP Confirmation Recharge!')
                    ->text('Bonjour Cher(e) ' . $user->fullName . ", votre demande d'achat de crypto a été bien réçu")
                    ->html('<p>Vous serez notifié lors de la confirmation</p>');
            }); */

            $newNotification = new Notification();
            $newNotification->sku_user = $user->sku_user;
            $newNotification->sku_notification = "NTF-0" . count(Notification::all());
            $newNotification->type = "Achat Crypto";
            $newNotification->ref = 'cbp@cbpcommunity.com';
            $newNotification->date = date("d/m/Y");
            $newNotification->destination_name = $user->fullName;
            $newNotification->destination_description = "";
            $newNotification->destination_adress = "";
            $newNotification->destination_gender = "";
            $newNotification->header = "CBP Achat Crypto!";
            $newNotification->object = 'CBP Achat Crypto!';
            $newNotification->content = "Bonjour Cher(e) " . $user->fullName . ", votre demande d'achat de crypto a été bien réçu";
            $newNotification->description = '<p>Vous serez notifié lors de la confirmation</p>';
            $newNotification->email_destination = $user->email;
            $newNotification->save();

            return response()->json(
                [
                    'message' => "Achat des cryptos de " . $request->amount . "$ effectué avec succèss",
                    'code' => 200
                ]
            );

            /*  $utils = new FunctionCollection();
            $soldes =  $utils->WalletBalance();

            if ($soldes['wallet_balance'] < $request->amount) {
                return response()->json(
                    [
                        'message' => "Votre solde (".$soldes['wallet_balance']."$) est inférieur au montant au prix des cryptos. Parrainez et gagner plus d'argent."
                    ],
                    400
                );
            } else {

            } */
        } catch (\Exception $ex) {
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

            if (!$transaction = Transaction::find($request->id)) {
                throw new NotFoundHttpException('Transaction non trouvé de ref= ' . $request->id);
            }

            // code d'activation
            $transaction->status = 1;
            $transaction->save();

            // message vers demandeur
            $transactionUserData = User::where(['sku_user' => $transaction->sku_user])->first(['sku_user', 'sku_user_parent', 'fullName', 'email']);
            // infos demandeur
            $newNotification = new Notification();
            $newNotification->sku_user = $transactionUserData->sku_user;
            $newNotification->sku_notification = "NTF-0" . count(Notification::all());
            $newNotification->type = "Confirmation";
            $newNotification->ref = 'cbp@cbpcommunity.com';
            $newNotification->date = date("d/m/Y");
            $newNotification->destination_name = $transactionUserData->fullName;
            $newNotification->destination_description = "";
            $newNotification->destination_adress = "";
            $newNotification->destination_gender = "";
            $newNotification->header = "CBP Confirmation!";
            $newNotification->object = 'CBP Confirmation!';
            $newNotification->content = 'Bonjour Cher(e) ' . $transactionUserData->fullName . ", Votre retrait de " . $transaction->amount . "$ a été confirmée";
            $newNotification->description = '<p>Merci de nous faire confiance.</p>';
            $newNotification->email_destination = $transactionUserData->email;
            $newNotification->save();

            return response()->json(
                [
                    'message' => "Confirmation de la transaction Effectuée.",
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

            if (!$transaction = Transaction::find($id)) {
                throw new NotFoundHttpException('Transaction non trouvée pour la référence: ' . $id);
            }

            // code d'activation
            $transaction->status = 2;
            $transaction->save();

            // message vers demandeur
            $transactionUserData = User::where(['sku_user' => $transaction->sku_user])->first(['sku_user', 'sku_user_parent', 'fullName', 'email']);
            // infos demandeur
            $newNotification = new Notification();
            $newNotification->sku_user = $transactionUserData->sku_user;
            $newNotification->sku_notification = "NTF-0" . count(Notification::all());
            $newNotification->type = "Rejet";
            $newNotification->ref = 'cbp@cbpcommunity.com';
            $newNotification->date = date("d/m/Y");
            $newNotification->destination_name = $transactionUserData->fullName;
            $newNotification->destination_description = "";
            $newNotification->destination_adress = "";
            $newNotification->destination_gender = "";
            $newNotification->header = "CBP Rejet de Retrait!";
            $newNotification->object = 'CBP Rejet de Retrait!';
            $newNotification->content = 'Bonjour Cher(e) ' . $transactionUserData->fullName . ", Votre retrait de " . $transaction->amount . "$ a été réjeté";
            $newNotification->description = '<p>Vérifier vos informations puis réessayer svp.</p>';
            $newNotification->email_destination = $transactionUserData->email;
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
            $transactionInfos = Transaction::find($id);
            // $full_destination_url = url($transactionInfos["image"]);
            // append image full url //
            // $transactionInfos['image_url'] = $full_destination_url;
            // $transactionInfos['modules'] = '[{"sku_transaction_parent":null,"sku_module":"module-1663742309717","name":"A propos du logiciel","route":"get-start","icon":null}]';
            return response()->json(
                [
                    'data' => $transactionInfos,
                    'message' => "Information de l'element",
                    'code' => 200
                ]
            );
        } catch (\Exception $ex) {
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
            $transaction = Transaction::find($request->id);
            $data = $request->all();
            foreach ($data as $key => $value) {
                if ($key != "sku_transaction" && $key != "sku_transaction" && $key != "created_at" && $key != "updated_at" && $key != "id" && $value != "null") {
                    if (is_array($value)) {
                        // convert to json string
                        $transaction->$key = json_encode($value);
                    } else {
                        if ($key != "sku_transaction" && $value != "null") {
                            $transaction->$key = $value;
                        }
                    }
                }
            }

            $transaction->save();
            return response()->json(
                [
                    'message' => "Mise a jour transaction effectuée",
                    'code' => 200
                ]
            );
        } catch (\Exception $ex) {
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
            $transaction = Transaction::find($id);
            $transaction->delete();
            return response()->json(
                [
                    'message' => "Suppression de l'element effectuée",
                    'code' => 200
                ]
            );
        } catch (\Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur survenu lors de la suppression",
                    'code' => 500
                ]
            );
        }
    }
}
