<?php

namespace App\Http\Controllers;

use App\Exports\UsersExport;
use App\Models\Agent;
use App\Models\Department;
use App\Models\Permission;
use Illuminate\Http\Request;
use App\Models\User;
// use Laravel\Passport\HasApiTokens;
use Illuminate\Validation\Validator;
use Illuminate\Validation\Rules\Password;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Permission\Models\Role as SpatieRoleModel;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Tymon\JWTAuth\Exceptions\JWTException;
use \Exception;

class userController extends Controller
{
    public function profile(){
        if(!$user=auth()->user()){
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        try {
            // Get user avatar URL
            $avatarUrl = null;
            if ($user->avatar) {
                $baseUrl = url('/');
                $avatarUrl = str_starts_with($user->avatar, 'http')
                    ? $user->avatar
                    : $baseUrl . '/' . $user->avatar;
            }

            // Get statistics
            $stats = $this->getUserStatistics($user);

            $userInfos = [
                'id' => $user->id,
                'fullName' => trim(($user->firstname ?? '') . ' ' . ($user->lastname ?? '')),
                'firstname' => $user->firstname ?? '',
                'lastname' => $user->lastname ?? '',
                'username' => $user->username ?? '',
                'email' => $user->email ?? '',
                'phone' => $user->phone ?? '',
                'role' => $user->role ?? 'User',
                'created_at' => $user->created_at,
                'status' => $user->status ?? 'active',
                'sku_user' => $user->sku_user ?? '',
                'sku_corporation' => $user->sku_corporation ?? '',
                'statistics' => $stats
            ];

            return response()->json(
                [
                    'data' => $userInfos,
                    'userAvatar' => $avatarUrl,
                    'message' => "User Infos",
                    'code' => 200
                ]
            );
        } catch (HttpException $th) {
            throw $th;
        }
    }

    private function getUserStatistics($user)
    {
        // Count tasks/transactions
        $taskCount = \DB::table('transactions')
            ->where('sku_user', $user->sku_user)
            ->count();

        // Count network connections (users in same corporation)
        $connectionsCount = \DB::table('users')
            ->where('sku_corporation', $user->sku_corporation)
            ->where('id', '!=', $user->id)
            ->count();

        // Count investments
        $investmentsCount = \DB::table('investments')
            ->where('sku_user', $user->sku_user)
            ->count();

        return [
            'tasks' => $taskCount,
            'connections' => $connectionsCount,
            'projects' => $investmentsCount
        ];
    }

    public function uploadUserPicture(Request $request)
    {

        if(!$user=auth()->user()){
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        try {
            $folder = "avatars";
            $full_destination_path = public_path($folder);
            $file_name = $request->sku_corporation . "-" . date("dmyis") . "-avatar.jpg";
            $request->avatar->move($full_destination_path, $file_name);

            $final_name_mini = $folder . "/" . $file_name;

            // update table infos
            $corporation = User::where(["email" => $user->email])->first();
            $corporation->avatar = $final_name_mini;
            $corporation->save();

            // 'full_url' => url($final_name_mini),
            return response()->json(
                [
                    'full_url' => $final_name_mini,
                    'message' => "Mise a jour avatar effectuée",
                    'code' => 200
                ]
            );
        } catch (Exception $ex) {
            return response()->json(
                [
                    'full_url' => "",
                    'message' => "Erreur envoi avatar photo au serveur.",
                    'code' => 300
                ]
            );
        }
    }

    public function index(Request $request)
    {
        $usersInfos = [];
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
                $usersInfos = User::where($condition_array)
                    ->orderBy($sortField, $sortMethod)->skip(0)
                    ->take($request['perPage'])
                    ->get();
            } else {
                $usersInfos = User::where($condition_array)
                    ->orderBy($sortField, $sortMethod)
                    ->skip(($request['page'] * $request['perPage']) - $request['perPage'])
                    ->take($request['perPage'])
                    ->get();
            }
        } else {
            // all
            $usersInfos = User::all();
        }

        return response()->json(["data" => $usersInfos, "totalData" => count(User::all())]);
    }

    private function respondeWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60,
        ]);
    }

    public function export()
    {
        return Excel::download(new UsersExport, 'users.xlsx');
    }

   /*  public function login(Request $request)
    {
        return response()->json(['message' => 'login test', 'status' => 400]);

        try {
            //
            $account = $request->account;
            // $password = $request->password ;
            $password = bcrypt($request->password);

            // get user data
            $userData = User::where(['email' => $account, 'password' => $password])->get();

            // user jwt token
            $token = date("sYmdhiYs");

            // get raw result
            $userDataResponse = json_decode($userData, true);

            // construct default super-admin permissions
            $fullPermissions = [];
            $departmentObject = new Department();
            $departments = $departmentObject::all();
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
                    $permissions[] = array(
                        "module" => $module->name,
                        "route" => $module->route,
                        "ressource" => $module->route,
                        "creation" => true,
                        "lecture" => true,
                        "modification" => true,
                        "suppression" => true,
                        "folder" => $haveFolder
                    );
                }
                // add department to output
                $fullPermissions[] = array(
                    "name" => $department['name'],
                    "route" => $department['route'],
                    "icon" => $department['icon'],
                    "modules" => $permissions
                );
            }

            // check if result exists
            if (isset($userDataResponse["0"])) {
                // result exists
                // get first row
                $userDataPHPArray = $userDataResponse["0"];

                // check account
                if ($account == $userDataPHPArray['email'] or $account == $userDataPHPArray['username']) {
                    // check password
                    if ($password == $userDataPHPArray['password']) {
                        // ok
                        // get departments list
                        $roles = new Role();

                        $role =  $userDataPHPArray['role'];

                        $abilities = [];
                        if ($role == "coordonateur" or $role == "super-admin" or $role == "admin") {
                            $roleInfos = $roles::where(['name' => $role])->get();
                            $permissions = $fullPermissions; // $roleInfos[0]['permissions'];
                            $level = 7;
                            $abilities = [array("action" => "manage", "subject" => "all")];
                        } else {
                            // custom abilities
                            // $abilities = [array("action" => "read", "subject" => "Auth")];
                            $roleInfos = $roles::where(['name' => $role])->get();
                            $permissions = $fullPermissions; // $roleInfos[0]['permissions'];
                            $level = $roleInfos[0]['level'];
                            $abilities = [array("action" => "manage", "subject" => "all")];
                        }
                        // founded
                        $userDataDefault = [
                            "id" => $userDataPHPArray['id'],
                            "sku_corporation" => $userDataPHPArray['sku_corporation'],
                            "fullName" => $userDataPHPArray['fullName'],
                            "avatar" => $userDataPHPArray['avatar'],
                            "email" => $userDataPHPArray['email'],
                            "username" => $userDataPHPArray['username'],
                            "password" => $request->password,
                            "passwordEncrypted" => $userDataPHPArray['password'],
                            "role" => $userDataPHPArray['role'],
                            "ability" => $abilities,
                            "special_permissions" => json_encode([]),
                            "departmentData" => $permissions,
                            "extras" => ["eCommerceCartItemsCount" => $userDataPHPArray['id']],
                            "token" => $token,
                            "level" => $level,
                            'message' => "Données de l'utilisateur",
                            'code' => 200,
                        ];

                        return json_encode($userDataDefault);
                    } else {
                        return response()->json(
                            [
                                // 'data' => json_decode($data),
                                'message' => "Mot de passe incorrecte." . $account . " >> " . $password,
                                'code' => 404,
                            ]
                        );
                    }
                } else {
                    // account error
                    return response()->json(
                        [
                            // 'data' => json_decode($data),
                            'message' => "Compte incorrecte",
                            'code' => 404,
                        ]
                    );
                }
            } else {
                // null , no result
                return response()->json(
                    [
                        // 'data' => json_decode($data),
                        'message' => "Compte ou Mot de passe incorrecte",
                        'code' => 404,
                    ]
                );
            }
        } catch (Exception $ex) {
            return response()->json(
                [
                    'message' => "Erreur de connexion",
                    'code' => 500,
                ]
            );
        }
    } */
    /**
     * Display the specified resource.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        if (!$data_response = User::find($id)) {
            throw new NotFoundHttpException('User non trouvé de ref= ' . $id);
        }
        return response()->json(['message' => 'User infos', 'data' => $data_response]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function userInfos($id)
    {
        if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        if (!$data_response = User::find($id)) {
            throw new NotFoundHttpException('User non trouvé de ref= ' . $id);
        }
        return response()->json(['message' => 'User infos', 'data' => $data_response]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {

        if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        $user = User::find($id);
        $data = $request->all();
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                // convert to json string
                $user->$key = json_encode($value);
            } else {
                if ($key != "created_at" && $key != "updated_at" && $key != "id" && $value != "null") {
                    $user->$key = $value;
                }
            }
        }

        // update user who update
        $user->sku_user = $user->sku_user;
        $user->save();
        return response()->json(
            [
                'message' => "Mise a jour Utilisateur effectuée",
                'code' => 200
            ]
        );
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request)
    {
        $user = User::find($request->id);
        $user->delete();
        return response()->json(
            [
                'message' => "Suppression utilisateur effectuée",
                'code' => 200
            ]
        );
    }

    /**
     * Impersonate a user (Silent Login)
     * Allows an admin to login as another user without their password
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function impersonate($id)
    {
        // Verify admin is authenticated
        if (!$admin = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        try {
            // Find the target user
            $targetUser = User::find($id);

            if (!$targetUser) {
                throw new NotFoundHttpException('Utilisateur non trouvé');
            }

            // Prevent impersonating yourself
            if ($admin->id === $targetUser->id) {
                return response()->json([
                    'message' => 'Vous ne pouvez pas vous impersonner vous-même',
                    'code' => 400
                ], 400);
            }

            // Generate a new token for the target user
            $token = auth()->login($targetUser);

            return response()->json([
                'message' => 'Impersonation réussie',
                'access_token' => $token,
                'token_type' => 'bearer',
                'expires_in' => auth()->factory()->getTTL() * 60,
                'user' => [
                    'id' => $targetUser->id,
                    'fullName' => $targetUser->fullName,
                    'email' => $targetUser->email,
                    'username' => $targetUser->username,
                    'avatar' => $targetUser->avatar,
                    'role' => $targetUser->role
                ],
                'code' => 200
            ]);
        } catch (Exception $ex) {
            return response()->json([
                'message' => 'Erreur lors de l\'impersonation',
                'error' => $ex->getMessage(),
                'code' => 500
            ], 500);
        }
    }
}
