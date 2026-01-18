<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Controllers\FunctionCollection;
use App\Http\Controllers\platformConfig;
use App\Models\Department;
use Spatie\Permission\Models\Role as SpatieRoleModel;
use App\Models\User;
use App\Models\Account;
use App\Models\Parring;
use App\Models\Bonus;
use App\Models\Investor;
use App\Models\Notification;
use App\Models\Subscription;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Validator;
use Illuminate\Validation\Rules\Password;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{

    public function login(Request $request)
    {
        $rules = [
            'email' => [
                'required',
                'email',
                'max:255',
            ],
            'password' => [
                'required',
                'string',
                'max:32',
            ],
        ];

        $validator = Validator($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'validation errors' => $validator->errors()
            ], 404);
        }
        // validation ok

        // process login
        return $this->getLoggedUserData($request);
    }

    public function getLoggedUserData(Request $request)
    {

        $credentials = $request->only('email', 'password');
        try {
            if (!$token = auth()->attempt($credentials)) {
                return response()->json(['message' => 'Compte ou mot de passe incorrect.'], 401); //->setStatusCode(401);.json_encode($credentials)
            };
        } catch (JWTException $e) {
            throw $e;
        }

        try {
            // check if user exists and logged in
            if (!$user = auth()->user()) {
                throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
            }

            $platformConfig = new platformConfig();
            $functionCollection = new FunctionCollection();
            $infosData = $functionCollection->WalletBalance();

            $directParing = User::where("sku_user_parent", $user->sku_user)->get()->toArray();
            if (count($directParing) > $platformConfig->vip_direct_parring_requirement OR $infosData['show_debt_message'] == false) {
                // migrate to VIP 2
                $curentUser = User::where("sku_user", $user->sku_user)->first();

                // check if is super admin / admin
                if($curentUser->role == "super-admin" or $curentUser->role == "admin"){
                    // leave super admin as is
                }else{
                    $curentUser->role = "VIP-2";
                    $curentUser->save();
                }
            }

            // reconnect user
            $credentials = $request->only('email', 'password');
            try {
                if (!$token = auth()->attempt($credentials)) {
                    return response()->json(['message' => 'Compte ou mot de passe incorrect.'], 401); //->setStatusCode(401);.json_encode($credentials)
                };
            } catch (JWTException $e) {
                throw $e;
            }

            // connect user
            if (!$user = auth()->user()) {
                throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
            }

            // Initial abilities
            $abilities = [array("action" => "read", "subject" => "ACL"), array("action" => "read", "subject" => "Auth")];
            $roleAndPermissions = auth()->check() ? auth()->user()->jsPermissions() : 0;

            // get all inherited permissions for that user
            $permissionsOnly = $user->getAllPermissions();

            $vpi1modules = ["subscription", "bonus", "gain", "paring", "doc", "payment", "wallet", "transaction", "cash", "file", "coin", "coinsale", "recharge", "transfert"];
            $vpi2modules = [];

            // old version
            // construct default super-admin permissions
            $fullPermissions = [];
            $departmentObject = new Department();
            $departments = $departmentObject::where(['status' => "1"])->get();
            for ($i_d = 0; $i_d < count($departments); $i_d++) {
                $department = $departments[$i_d];
                $departmentModules = json_decode($department['modules']);

                // boucle de modules
                $permissions = [];
                for ($i_m = 0; $i_m < count($departmentModules); $i_m++) {

                    $module = $departmentModules[$i_m];

                    $haveFolder = false;
                    if (isset($module->folder)) {
                        $haveFolder = true;
                    };
                    // add module to permissions
                    if ($module->route == 'get-start') {
                        // gest block access
                    } else {
                        // add module to abilities
                        $permissions[] = array(
                            "module" => $module->name,
                            "route" => $module->route,
                            "ressource" => $module->route,
                            "list" => true,
                            "add" => true,
                            "view" => true,
                            "update" => true,
                            "delete" => true,
                            "monitoring" => true,
                            "folder" => $haveFolder
                        );

                        if ($user->role == "VIP-1") {
                            if (in_array($module->route, $vpi1modules)) {
                                $abilities[] = array("action" => "read", "subject" => $module->route);
                            }
                        } elseif ($user->role == "VIP-2") {
                            if (in_array($module->route, $vpi1modules) or in_array($module->route, $vpi2modules)) {
                                $abilities[] = array("action" => "read", "subject" => $module->route);
                            }
                        } else {
                            $abilities[] = array("action" => "read", "subject" => $module->route);
                        }
                    }
                }

                // add department to abilities
                // array_push($abilities, array("action" => "read", "subject" => $department['route']));
                $abilities[] = array("action" => "read", "subject" => $department['route']);


                // add department to output
                if ($user->role == "VIP-1" || $user->role == "VIP-2") {
                    if ($module->name == "Administration") {
                        $fullPermissions[] = array(
                            "name" => "Paramétrer",
                            "route" => $department['route'],
                            "icon" => $department['icon'],
                            "modules" => $permissions
                        );
                    } else {
                        $fullPermissions[] = array(
                            "name" => $department['name'],
                            "route" => $department['route'],
                            "icon" => $department['icon'],
                            "modules" => $permissions
                        );
                    }
                } else {
                    // client mode
                    $fullPermissions[] = array(
                        "name" => $department['name'],
                        "route" => $department['route'],
                        "icon" => $department['icon'],
                        "modules" => $permissions
                    );
                }
            }

            // founded
            $userDataDefault = [
                "id" => $user->id,
                "sku_corporation" => $user->sku_corporation,
                "sharedLink" => "https://app.cbpcommunity.com/" . "register" . "/" . $user->sku_user,
                "sku_user" => $user->sku_user,
                "fullName" => $user->fullName,
                "avatar" => $user->avatar,
                "email" => $user->email,
                "username" => $user->username,
                "password" => $request->password, //
                "passwordEncrypted" => $user->password,
                "role" => $user->role,
                "ability" => $abilities,
                "msgtasktimeout" => 60000,
                "special_permissions" => json_encode($roleAndPermissions),
                "departmentData" => $fullPermissions,
                "extras" => ["eCommerceCartItemsCount" => $user->id],
                "token" => $token,
                "level" => $user->level,
            ];

            return $this->respondeWithToken($token, $userDataDefault);
        } catch (HttpException $th) {
            throw $th;
        }
    }

    public function store(Request $request)
    {
        $rules = [
            'email' => [
                'required',
            ],
            'phone' => [
                'required',
            ],
            'password' => [
                'required',
            ],
            'sku_user_parent' => [
                'required',
            ],
            'fullName' => [
                'required',
            ],
        ];

        $validator = Validator($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'erreurs de validation' => $validator->errors()
            ]);
        }

        if ($request->accept_contrat != "true") {
            return response()->json([
                'message' => "Vous n'avez pas accépter le contrat"
            ]);
        }

        // vars init
        $sku_user_generated = "cbp-inv" . md5($request->email);
        $role_pack_code = "";
        $role_pack_code = "VIP-1";

        /* if(isset($request->role) && $request->role!=null && $request->role!=""){
            $role_pack_code = $request->role;
        }else{
            $role_pack_code = "VIP-1";
        } */

        $sumUsers = count(User::all());

        try {

            $parrentExists = User::where('sku_user', $request->sku_user_parent)
                ->orWhere('sku_user', str_ireplace("cbp-", "", $request->sku_user_parent))
                ->get();
            $emailExists = User::where('email', $request->email)
                ->get();
            $phoneExists = User::where('phone', $request->phone)
                ->get();

            if (count($parrentExists) <= 0) {
                return response()->json(
                    [
                        'message' => "Le parrain: `" . $request->sku_user_parent . "` est introuvable pas dans notre système, veuillez cliquer sur le lien qu'on vous a partager, puis réessayer svp."
                    ],
                    203
                );
            }

            if (count($emailExists) > 0) {
                return response()->json(
                    [
                        'message' => "Adresse email déjà utilisé"
                    ],
                    203
                );
            }

            if (count($phoneExists) > 0) {
                return response()->json(
                    [
                        'message' => "N° de téléphone déjà utilisé"
                    ],
                    203
                );
            }

            $userNew = User::create([
                'sku_corporation' => "CBP",
                'fullName' => $request->fullName,
                'username' => $request->email,
                'role' => $role_pack_code,
                'phone' => $request->phone,
                'email' => $request->email,
                'sku_user' => $sku_user_generated,
                'sku_user_parent' => $request->sku_user_parent,
                'password' => $request->get('password'),
            ]);

            // -----------------------------------------------------------------------
            $accountNew = Account::create([
                'sku_user'  => $sku_user_generated,
                'amount'    => 0,
                'currency'  => "USD",
            ]);

            $roleForNewUser = SpatieRoleModel::where('name', $role_pack_code)->first();
            $userNew->assignRole($roleForNewUser);

            // init investor
            $investorNew = Investor::create([
                'sku_user'  => $sku_user_generated,
                'sku_investor'  => $sku_user_generated,
                'sku_user_parent'  => $request->sku_user_parent,
                'package'  =>  $role_pack_code,
                'type'  =>  "Pigeon",
                'amount_paid'    => 0,
                'child' => 0,
                'stop_gain' => 0,
                'date_start' => date("Y-m-d"),
            ]);

            // create parring
            $parringNew = Parring::create([
                'sku_user' => $sku_user_generated,
                'sku_user_parent' => $request->sku_user_parent,
            ]);

            // mlm algo
            // childs iteration
            $parentUser = Parring::where(['sku_user_parent' => $request->sku_user_parent]);
            $parentExistingChilds = Parring::where(['sku_user_parent' => $request->sku_user_parent])->get();

            $data_return = [];
            if (count($parentExistingChilds) <= 0) {
                // no existing parring
            } else {
                // parring(s) exists

                foreach ($parentExistingChilds as $child_key => $child_value) {
                    $data_return[] = $child_value;
                    if ($child_value['child_left'] != "" && $child_value['child_right'] != "") {
                        // left and right childs exists
                        // continue next
                    } else {

                        // check if existing child position with new user
                        $childExistingParring = Parring::where(['child_left' => $sku_user_generated])
                            ->orWhere(['child_right' => $sku_user_generated])
                            ->get();

                        if (count($childExistingParring) <= 0) {
                            // no existing parring
                            if ($child_value['child_left'] == "") {
                                // left child not exists (we add child there)
                                $childParring = Parring::find($child_value['id']);
                                $childParring->child_left = $sku_user_generated;
                                // increment child
                                $childParring->child = $childParring->child + 1;
                                $childParring->save();

                                // exit iteration
                                continue;
                            } elseif ($child_value['child_right'] == "") {
                                // right child not exists
                                $childParring = Parring::find($child_value['id']);
                                $childParring->child_right = $sku_user_generated;
                                // increment child
                                $childParring->child = $childParring->child + 1;
                                $childParring->save();

                                // exit iteration
                                continue;
                            }
                        } else {
                            // already child parred
                        }
                    }
                }
            }

            // init subscription
            $subscriptionNew = Subscription::create([
                'sku_user'  => $sku_user_generated,
                'package_code'  =>  $role_pack_code,
                'amount'    => 45,
            ]);

            // if parent access 20 parring then migrate her level
            if (count($parentExistingChilds) + 1 == 20) {
                // migrate to VIP-2
            }

            /*   \Illuminate\Support\Facades\Mail::send([], [], function (\Illuminate\Mail\Message $message) use ($userNew, $request) {
                $message
                    ->from('cbp@cbpcommunity.com')
                    ->to($userNew->email)
                    ->subject('CBP Community!')
                    ->text($userNew->fullName . ', bienvenu dans la communauté CBP!')
                    ->html('<p>Vous pouvez nous rejoindre a tout moment de la journée</p>');
            }); */

            $newNotification = new Notification();
            $newNotification->sku_user = $userNew->sku_user;
            $newNotification->sku_notification = "NTF-0" . count(Notification::all());
            $newNotification->type = "Authentification";
            $newNotification->ref = 'cbp@cbpcommunity.com';
            $newNotification->date = date("d/m/Y");
            $newNotification->destination_name = $userNew->fullName;
            $newNotification->destination_description = "";
            $newNotification->destination_adress = "";
            $newNotification->destination_gender = "";
            $newNotification->header = "CBP Community!";
            $newNotification->object = 'CBP Community!';
            $newNotification->content = $userNew->fullName . ', bienvenu dans la communauté CBP!';
            $newNotification->description = '<p>Vous pouvez nous rejoindre a tout moment de la journée</p>';
            $newNotification->email_destination = $userNew->email;
            $newNotification->save();


            // login the created user
            // return $this->getLoggedUserData($request);

        } catch (Exception $ex) {
            return response()->json(
                [
                    'error' => $ex,
                    'message' => "Erreur exceptionnelle survenu code: X2021"
                ],
                300
            );
        } catch (\Throwable $er) {
            //do something when Throwable is thrown
            // throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
            return [
                "exception" => $er,
            ];
        }
    }

    public function reset(Request $request)
    {
        try {
            if (isset($request->email) and $request->email != "") {

                $digits_needed = 8;

                $random_number = ''; // set up a blank string

                $count = 0;

                while ($count < $digits_needed) {
                    $random_digit = mt_rand(0, 9);

                    $random_number .= $random_digit;
                    $count++;
                }

                $user = User::where(["email" => $request->email])->first();
                if ($user == null) {
                    return response()->json(
                        [
                            'message' => "Cet adresse est introuvable dans notre système"
                        ],
                        203
                    );
                }
                $user->remember_token = $random_number;
                $user->save();

                $data_to_past = [
                    "email" => $user->email,
                    "remember_token" => $user->remember_token
                ];

                \Illuminate\Support\Facades\Mail::send([], [], function (\Illuminate\Mail\Message $message) use ($data_to_past) {
                    $message
                        ->from('cbp@cbpcommunity.com')
                        ->to($data_to_past['email'])
                        ->subject('CBP Réinitialisation du mot de passe !')
                        ->text('Bonjour Cher(e) membre, copier le code en couleur rouge puis aller le mettre dans le formulaire de réinitialisation du mot de passe')
                        ->html('<p>Votre code de reinitialisation est:<br><strong style="font-size: 50px; color:red">' . $data_to_past['remember_token'] . '</strong></p>');
                });

                /*  $newNotification = new Notification();
                $newNotification->sku_user = $user->sku_user;
                $newNotification->sku_notification = "NTF-0" . count(Notification::all());
                $newNotification->type = "Authentification";
                $newNotification->ref = 'cbp@cbpcommunity.com';
                $newNotification->date = date("d/m/Y");
                $newNotification->destination_name = $user->fullName;
                $newNotification->destination_description = "";
                $newNotification->destination_adress = "";
                $newNotification->destination_gender = "";
                $newNotification->header = "CBP Réinitialisation du mot de passe !";
                $newNotification->object = 'CBP Réinitialisation du mot de passe !';
                $newNotification->content = 'Bonjour Cher(e) membre, copier le code en couleur rouge puis aller le mettre dans le formulaire de réinitialisation du mot de passe';
                $newNotification->description = '<p>Votre code de reinitialisation est:<br><strong style="font-size: 50px; color:red">' . $user->remember_token . '</strong></p>';
                $newNotification->email_destination = $user->email;
                $newNotification->save(); */

                return response()->json(
                    [
                        'message' => "Consulter votre adresse email pour accéder à l'étape de réinitialisation."
                    ],
                    200
                );
            } else {
                return response()->json(
                    [
                        'message' => "Saisissez un adresse email valide svp."
                    ],
                    400
                );
            }
        } catch (JWTException $e) {
            return response()->json(
                [
                    'message' => "Erreur exceptionnelle survenu code: X202961"
                ],
                500
            );
        }
    }

    public function change(Request $request)
    {
        try {
            if ($request->password == $request->cPassword) {

                $user = User::where(["remember_token" => $request->reset_code])->first();
                if ($user == null) {
                    return response()->json(
                        [
                            'message' => "Ce code: " . $request->reset_code . " est invalide, récommencer la procédure ou saississez bien votre code svp."
                        ],
                        203
                    );
                }

                $user->password = $request->password;
                // $user->remember_token = ""; // reset
                $user->save();

                $data_to_past = [
                    "email" => $user->email
                ];

                /* \Illuminate\Support\Facades\Mail::send([], [], function (\Illuminate\Mail\Message $message) use ($data_to_past) {
                    $message
                        ->from('cbp@cbpcommunity.com')
                        ->to($data_to_past['email'])
                        ->subject('CBP Changement du mot de passe !')
                        ->text('Bonjour Cher(e) membre, votre mot de passe a été changé avec succès')
                        ->html('<p>Merci pour votre confiance</strong></p>');
                }); */

                $newNotification = new Notification();
                $newNotification->sku_user = $user->sku_user;
                $newNotification->sku_notification = "NTF-0" . count(Notification::all());
                $newNotification->type = "Authentification";
                $newNotification->ref = 'cbp@cbpcommunity.com';
                $newNotification->date = date("d/m/Y");
                $newNotification->destination_name = $user->fullName;
                $newNotification->destination_description = "";
                $newNotification->destination_adress = "";
                $newNotification->destination_gender = "";
                $newNotification->header = "CBP Changement du mot de passe !";
                $newNotification->object = 'CBP Changement du mot de passe !';
                $newNotification->content = 'Bonjour Cher(e) membre, votre mot de passe a été changé avec succès';
                $newNotification->description = '<p>Merci pour votre confiance</strong></p>';
                $newNotification->email_destination = $user->email;
                $newNotification->save();

                return response()->json(
                    [
                        'message' => "Changement du mot de passe réussi."
                    ],
                    200
                );
            } else {
                return response()->json(
                    [
                        'message' => "Vos mots de passe ne correspondent pas."
                    ],
                    400
                );
            }
        } catch (JWTException $e) {
            return response()->json(
                [
                    'message' => "Erreur exceptionnelle survenu code: X20296R1"
                ],
                500
            );
        }
    }

    public function refresh()
    {
        try {
            if (!$token = auth()->getToken()) {
                throw new NotFoundHttpException('Token non trouvé');
            }
            return $this->respondeWithToken(auth()->refresh($token));
        } catch (JWTException $e) {
            throw $e;
        }
    }

    public function logout()
    {
        try {
            auth()->logout();
        } catch (JWTException $e) {
            throw $e;
        }
        return response()->json([
            'message' => 'User loggen out successfully'
        ]);
    }

    private function respondeWithToken($token, $userData = null)
    {
        try {
            return response()->json([
                'access_token' => $token,
                'token_type' => 'bearer',
                'expires_in' => auth()->factory()->getTTL() * 24 * 60 * 60,
                'message' => "Données de l'utilisateur",
                'data' => $userData
            ], 200);
        } catch (\Throwable $th) {
            throw $th;
        }
    }
}
