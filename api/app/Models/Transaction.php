<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;
    protected $casts = [
        'created_at'  => 'date:d-m-Y'
    ];
    public function user()
    {
        return $this->hasOne(User::class, 'sku_user', 'sku_user');
    }

    public function destinationUser()
    {
        return $this->hasOne(User::class, 'sku_user', 'sku_user_destination');
    }
}
