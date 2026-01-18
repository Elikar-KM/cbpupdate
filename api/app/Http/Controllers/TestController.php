<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class TestController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function test()
    {

        foreach (User::all() as $userKey => $userObject) {
            # get package subscribed

            return response()->json([
                'userData' => $userObject->role,
                'message' => "Test",
            ]);

        }

    }
}
