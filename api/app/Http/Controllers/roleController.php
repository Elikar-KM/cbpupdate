<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Spatie\Permission\Models\Role as RoleBySpatie;
use Spatie\Permission\Models\Permission as PermissionBySpatie;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class roleController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
       /*  if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        } */

        //  $stores = Store::where('owner_id', $user->id)->get();

        $roles = Role::all();

        // return $stores;
        return response()->json(['data' => $roles], 200);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()])->setStatusCode(404);
        }

        try {

            $departements = json_decode($request['permissions'], true);
            $permission_output_collection = [];
            // iterate values
            for ($i = 0; $i < count($departements); $i++) {
                $departement = $departements[$i];
                $modules = $departement['children'];
                for ($i_m = 0; $i_m < count($modules); $i_m++) {
                    // childrens iterator
                    $module = $modules[$i_m];
                    $actions = $module['children']; // $module['value'];
                    for ($i_a = 0; $i_a < count($actions); $i_a++) {
                        // childrens iterator
                        $action = $actions[$i_a];
                        if (isset($action['checked'])) {
                            // activated
                            $action_value = $action['value'];

                            // create
                            try {
                                PermissionBySpatie::create(['name' => $action_value, 'guard_name' => 'api']);
                                // sleep(1);
                                array_push($permission_output_collection, $action_value);
                            } catch (Exception $ex) {
                                // echo $ex;
                            }
                        }
                    }
                }
            } 

            // give permissions to role
            RoleBySpatie::create(
                [
                    'name' => $request['name'],
                    'guard_name' => 'api',
                    'permissions' => json_encode($request['permissions']),
                ]
            )->givePermissionTo($permission_output_collection);
            
        } catch (HttpException $th) {
            throw $th;
        }

        return response()->json(['message' => 'Role et Permissions crées'])->setStatusCode(200);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Role  $clinic
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        if (!$clinic = Role::find($id)) {
            throw new NotFoundHttpException('Dossier non trouvé de ref= ' . $id);
        }
        return response()->json(['message' => 'Dossier infos', 'data' => $clinic]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Role  $clinic
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        $roleID = $request->id;

        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()])->setStatusCode(404);
        }

        try {

            $departements = json_decode($request['permissions'], true);
            $permission_output_collection = [];
            // iterate values
            for ($i = 0; $i < count($departements); $i++) {
                $departement = $departements[$i];
                $modules = $departement['children'];
                for ($i_m = 0; $i_m < count($modules); $i_m++) {
                    // childrens iterator
                    $module = $modules[$i_m];
                    $actions = $module['children']; // $module['value'];
                    for ($i_a = 0; $i_a < count($actions); $i_a++) {
                        // childrens iterator
                        $action = $actions[$i_a];
                        if (isset($action['checked'])) {
                            // activated
                            $action_value = $action['value'];

                            // create
                            try {
                                PermissionBySpatie::create(['name' => $action_value, 'guard_name' => 'api']);
                                // sleep(1);
                                array_push($permission_output_collection, $action_value);
                            } catch (Exception $ex) {
                                // echo $ex;
                            }
                        }
                    }
                }
            } 

            if ($request['name'] == "super-admin" or $request['name'] == "coordo") {
                // super admin
                /* RoleBySpatie::create([
                    'name' => $request['name'],
                    'guard_name' => 'api',
                    'permissions' => json_encode($request['permissions']),                    
                ])->givePermissionTo(PermissionBySpatie::all()); */
                RoleBySpatie::update([
                    'name' => $request['name'],
                    'guard_name' => 'api',
                    'permissions' => json_encode($request['permissions']),                    
                ])->givePermissionTo(Permission::all());
            } else {
                // give permissions to role
                RoleBySpatie::update(
                    [
                        'name' => $request['name'],
                        'guard_name' => 'api',
                        'permissions' => json_encode($request['permissions']),
                    ]
                )->givePermissionTo($permission_output_collection);
            }
        } catch (HttpException $th) {
            throw $th;
        }

        return response()->json(['message' => 'Role et Permissions crées'])->setStatusCode(200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Role  $clinic
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        if (!$clinic = Role::find($id)) {
            throw new NotFoundHttpException('Dossier non trouvé');
        }
        try {
            $clinic->delete();
            return response()->json(['message' => 'Suppression dossier réussi', 'id' => $id])->setStatusCode(200);
        } catch (HttpException $e) {
            throw $e;
        }
    }
}
