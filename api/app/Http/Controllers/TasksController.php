<?php

namespace App\Http\Controllers;

use App\Models\Tasks;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class TasksController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function sendGains(Request $request)
    {

        // unblock max execution time
        ini_set('max_execution_time', 36000); //10 heures

        $date = $request->date;
        $date2 = $request->date2;
        $skuuser = $request->skuuser;

        /*   try {
            // check if user exists and logged in
            if (!$user = auth()->user()) {
                throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
            }
        } catch (HttpException $th) {
            throw $th;
        } */

        //if ($user->role == "super-admin") {

            $now = time();
            if (isset($date) and $date != "" and strtotime($date) > $now) {
                // then it is in the future
                return response()->json(
                    [
                        'message' => "La date est dans le future"
                    ], 500
                );
            }

            if (isset($date2) and $date2 != "" and strtotime($date2) > $now) {
                // then it is in the future
                return response()->json(
                    [
                        'message' => "La date finale est dans le future"
                    ], 500
                );
            }

            \Artisan::call('testing:cron', ['date' => $date, 'date2' => $date2, 'skuuser' => $skuuser]);

            $response = \Artisan::output();

            return response()->json(
                [
                    'message' => $response
                ]
            );
        /* }else{
            return response()->json(
                [
                    'message' => "Accès Réfusé"
                ]
            );
        } */
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function TestTask(Request $request)
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Tasks  $tasks
     * @return \Illuminate\Http\Response
     */
    public function show(Tasks $tasks)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Tasks  $tasks
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Tasks $tasks)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Tasks  $tasks
     * @return \Illuminate\Http\Response
     */
    public function destroy(Tasks $tasks)
    {
        //
    }
}
