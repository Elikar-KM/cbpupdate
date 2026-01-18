<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserTransformer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Spatie\FlareClient\Http\Exceptions\NotFound;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class AdminUserController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //if(! $users = User::with('roles.permissions')->get()){
        
        if(! $users = UserTransformer::collection(User::all())  ){
            throw new NotFoundHttpException('Users not found');
        } 
        
        return response()->json( $users );

        /* ->collection($users, new UserTransformer)
        ->setStatusCode(200);  */
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'=> 'required|email|unique:users,email|max:30',
            'name'=> 'required|string|min:3|max:30',
            'firstname'=> 'required|string|min:3|max:30',
            'lastname'=> 'required|string|min:3|max:30',
            'gender'=> 'required|string|min:1',
        ]);

        if($validator->fails()){
            return response()->json(['errors'=> $validator->errors()])->setStatusCode(404);
        }

        try {
            $user = User::firstOrCreate(['email'=> $request->email], [
                'name'=>$request->name,
                'email'=>$request->email,
                'password'=>'Test@123',
            ]);
    
            $user->userProfile()->updateOrCreate(['user_id'=> $user->id], 
                [
                    'firstname'=> $request->firstname, 
                    'lastname'=> $request->lastname,
                    'gender'=> $request->gender,
                    'active'=> true,
                ]);
    
            $user->assignRole('customer');
        } catch (HttpException $th) {
            throw $th;
        }

        return response()->json(['message'=> 'Utilisateur crée', 'id'=> $user->id])->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        if(!$user = User::find($id)){
            throw new NotFound('Utilisateur non trouvé de ref= '.$id);
        }

        return response()->json(['message'=> 'User infos', 'data'=> UserTransformer::collection($user)]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        try {

            if(!$user = User::find($id)){
                throw new UnauthorizedHttpException('Utilisateur non trouvé de ref= '.$id);
            }

            // validate firstname
            if(!empty($request->firstname)){
                $validator = Validator::make($request->all(),[
                    'firstname'=> 'required|string|min:3|max:30'
                ]);
    
                if($validator->fails()){
                    return response()->json(['errors'=> $validator->errors(), 'id'=> $id])->setStatusCode(400);
                }

                $user->userProfile()->updateOrCreate(['user_id'=> $user->id], 
                [
                    'firstname'=> $request->firstname, 
                ]);
            }

            // validate lastname
            if(!empty($request->lastname)){
                $validator = Validator::make($request->all(),[
                    'lastname'=> 'required|string|min:3|max:30'
                ]);
    
                if($validator->fails()){
                    return response()->json(['errors'=> $validator->errors(), 'id'=> $id])->setStatusCode(400);
                }

                $user->userProfile()->updateOrCreate(['user_id'=> $user->id], 
                [
                    'lastname'=> $request->lastname, 
                ]);
            }   

            return response()->json(['message'=> 'Utilisateur admin modifié avec succès', 'id'=> $id])->setStatusCode(201);

        } catch (HttpException $th) {
            throw $th;
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        if(!$user = User::find ($id)){
            throw new NotFoundHttpException('User not found');
        }
        try {
            $user -> delete();
            return response()->json(['message'=> 'User deleted successfully', 'id'=> $id])->setStatusCode(200);
        } catch (HttpException $e) {
            throw $e;
        }
    }

    public function suspend($id)
    {
        if(!$user = User::find ($id)){
            throw new NotFoundHttpException('User not found');
        }
        try {
            $user -> userProfile->updateOrCreate(['user_id' => $user->id], 
            [
                'active'=>false
            ]); 
        } catch (HttpException $e) {
            throw $e;
        }

        return response()->json(['message'=> 'User suspended successfully', 'id'=> $id])->setStatusCode(200);
    }

    public function activate($id)
    {
        if(!$user = User::find ($id)){
            throw new NotFoundHttpException('User not found');
        }
        try {
            $user -> userProfile->updateOrCreate(['user_id' => $user->id], 
            [
                'active'=>true
            ]); 
        } catch (HttpException $e) {
            throw $e;
        }

        return response()->json(['message'=> 'User (re)activated successfully', 'id'=> $id])->setStatusCode(200);
    }
}
