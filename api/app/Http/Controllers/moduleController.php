<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Module;

class moduleController extends Controller
{
    public function getModules($token, Request $request)
    {
        $moduleInfos = Module::all();
        return response()->json(
            [
                'modulesInfos' => $moduleInfos,
                'message' => "Information de tous les Modules",
                'code' => 200
            ]
        );
    }

    public function getModuleInfo($token, $sku_module, Request $request)
    {
        $moduleInfos = Module::find($sku_module);
        return response()->json(
            [
                'moduleInfos' => $moduleInfos,
                'message' => "Information du Module",
                'code' => 200
            ]
        );
    }
}
