<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bonus extends Model
{
    use HasFactory;
    protected $fillable = [
        'sku_user', // parent
        'sku_user_origin', // child
        'sku_recharge', // child
        'amount',
        'currency',
        'reference',
        'designation',
        'origin',
        'description',
        'status',
    ];
    protected $casts = [
        'created_at'  => 'date:d-m-Y'
    ];
}
