<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Exists;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class isStoreOwner
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $storeID = $request->route('store');

        // Does the store request belong to the right user
        if(!$user =  auth()->user()){
            throw new NotFoundHttpException('Utilisateur non trouvé');
        }

        if(!$user->hasRole('store-owner') &&  !$user->hasRole('store-admin')){
            // proprietaire ou admin
            throw new AccessDeniedHttpException("L'utilisateur n'a pas de droit d'accès suffisant");
        }

        $exists = $user->stores()
                ->where(function($query) use ($storeID, $user){
                    $query->where('owner_id', $user->id);
                    if($storeID){
                        $query->where('id', $storeID);
                    }
                })
                ->exists();

        if(!$exists){
            throw new AccessDeniedHttpException('Ce shop ne vous appartient pas, voulez vous en créer un nouveau');
        }
        
        return $next($request);
    }
}
