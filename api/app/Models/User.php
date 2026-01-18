<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use LaravelAndVueJS\Traits\LaravelPermissionToVueJS;

class User extends Authenticatable implements JWTSubject
{
    // use HasFactory;
    use HasApiTokens, HasFactory, HasRoles, LaravelPermissionToVueJS;

    protected $fillable = [
        'sku_corporation',
        'sku_corporation_child',
        'role',
        'sku_user_parent',
        'username',
        'fullName',
        'email',
        'phone',
        'password',
        'sku_agent',
        'sku_user',

    ];

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    public function setPasswordAttribute($password)
    {
       if(!empty($password)){
           //$this->attributes['password']= $password;
           $this->attributes['password']=bcrypt($password);
       }
    }

    public function userProfile()
    {
       return $this->hasOne(UserProfile::class);
    }

    public function investor()
    {
       return $this->hasOne(Investor::class, 'sku_user', 'sku_user');
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class, 'sku_user', 'sku_user')->where('status', '=', '1');
    }

    public function recharges()
    {
        return $this->hasMany(Recharge::class, 'sku_user', 'sku_user');
    }

    public function gains()
    {
        return $this->hasMany(Gain::class, 'sku_user', 'sku_user'); // ->selectRaw('SUM(gains.amount) as sum_gains');
    }

    public function bonuses()
    {
        return $this->hasMany(Bonus::class, 'sku_user', 'sku_user');
    }

    public function transactionsReceived()
    {
        return $this->hasMany(Transaction::class, 'sku_user_destination', 'sku_user');
    }

    public function transactionsSent()
    {
        return $this->hasMany(Transaction::class, 'sku_user', 'sku_user');
    }
}
