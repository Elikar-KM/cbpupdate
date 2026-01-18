<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Gain extends Model
{
    use HasFactory;
    protected $fillable = [
        "sku_gain",
        "sku_user",
        "sku_user_origin",
        "reference",
        "period",
        "amount",
        "designation",
        "currency",
        "status",
    ];
    protected $casts = [
        'created_at'  => 'date:d-m-Y',
    ];

    public function users(){
        return $this->belongsTo('users', 'sku_user', 'sku_user');
    }
}
