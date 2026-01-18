<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class platformConfig extends Controller
{
    public $vip_direct_parring_requirement = 20;
    public $parring_gain_percent = 10;
    public $minimun_cash_request = 10;
    public $minimun_tranfert_amount = 1; // 2
    public $withdrawal_bonus_cost_percent = 5; // 5% du montant a retiré
    public $parring_bonus_percent = 10;
    public $withdrawal_amount_minimum = 10;
    public $withdrawal_amount_minimum_with_daily_gains = 1;
}
