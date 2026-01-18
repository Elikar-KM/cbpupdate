<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Investor extends Model
{
    use HasFactory;
    protected $casts = [
        'created_at'  => 'date:d-m-Y'
    ];
    protected $fillable = [
        'sku_user',
        'sku_investor',
        'sku_user_parent',
        'package',
        'type',
        'amount_paid',
        'actual_daily_gain',
        'childs',
        'stop_gain',
        'date_start',
    ];

    public function Subscriptions(){
        return $this->hasMany(Subscription::class, "sku_user", "sku_user");
    }

    public function User(){
        return $this->belongsTo(User::class, "sku_user", "sku_user");
    }
}
