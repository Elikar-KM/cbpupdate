<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    use HasFactory;
    protected $fillable = [
        'sku_user',
        'amount',
        'currency',
    ];
    protected $casts = [
        'created_at'  => 'date:d-m-Y'
    ];
}
