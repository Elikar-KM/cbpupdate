<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Corporation extends Model
{
    // protected  $primaryKey = 'sku_corporation';
    use HasFactory;
    protected $fillable = [
        'sku_corporation',
        'corporation_name',
        'corporation_name_mini',
        'logo_url',
        'login_cover_image',
        'login_title',
        'login_subtitle'
    ];
}
