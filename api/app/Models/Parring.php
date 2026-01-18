<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Parring extends Model
{
    use HasFactory;
    protected $fillable = [
        "sku_user",
        "sku_user_parent",
        "child",
        "child_left",
        "child_right",
    ];
    protected $casts = [
        'created_at'  => 'date:d-m-Y'
    ];
}
