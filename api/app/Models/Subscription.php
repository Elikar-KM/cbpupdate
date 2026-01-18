<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;
    protected $fillable = [
        'sku_user',
        'package_code',
        'amount',
    ];
    protected $casts = [
        'created_at'  => 'date:d-m-Y'
    ];

    public function package()
    {
        return $this->belongsTo(Package::class, 'package_code', 'code');
    }
}
