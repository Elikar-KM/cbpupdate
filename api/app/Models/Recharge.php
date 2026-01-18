<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Recharge extends Model
{
    use HasFactory;
    protected $casts = [
        // 'created_at'  => 'date:d-m-Y'
    ];
}
