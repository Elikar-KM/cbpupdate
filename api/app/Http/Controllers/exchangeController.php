<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Exchange;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class exchangeController extends Controller
{
    //
    public function getExchanceInfo($sku_corporation, Request $request)
    {
        $exchangeInfos = Exchange::find($sku_corporation);
        return response()->json(
            [
                'exchangeInfos' => $exchangeInfos,
                'message' => "Information de la valeur du $ USA",
                'code' => 200
            ]
        );
    }
}
