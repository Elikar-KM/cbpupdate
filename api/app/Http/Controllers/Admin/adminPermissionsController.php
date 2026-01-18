<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserPermissionTransformer;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class AdminPermissionsController extends Controller
{
    public function show($id)
    {
        if(!$user = User::find($id)){
            throw new NotFoundHttpException('User not found');
        }

        return UserPermissionTransformer::collection($user->getAllPermissions()) ;
    }
}