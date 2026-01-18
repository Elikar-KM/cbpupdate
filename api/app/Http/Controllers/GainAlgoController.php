<?php

namespace App\Http\Controllers;

use App\Models\Gain;
use App\Models\GainAlgo;
use App\Models\Package;
use App\Models\Subscription;
use App\Models\User;
use DateInterval;
use DatePeriod;
use DateTime;
use Exception;
use Illuminate\Http\Request;
use PHPUnit\Framework\MockObject\Stub\ReturnArgument;

use function PHPUnit\Framework\isNull;

class GainAlgoController extends Controller
{
    /**
     * Execute the algo.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\GainAlgo  $gainAlgo
     * @return \Illuminate\Http\Response
     */

    public function sendGains(Request $request)
    {
        $DateStart = $request->input('date');
        $DateEnd = date('Y-m-d', strtotime($DateStart . ' +1 day'));
        $skuuser = $request->input('email');

        return $this->executeSendGains($DateStart, $DateEnd, $skuuser);
    }

    public function executeSendGains($DateStart = "", $DateEnd = "", $skuuser = "")
    {
        // unblock max execution time
        ini_set('max_execution_time', 36000); //10 heures

        $current_sku_user_from_email = "";
        $textSuffixUser = "";

        try {
            // defini dates
            if ($DateStart == "" or $DateStart == null) {
                $DateStart = date("Y-m-d 00:00");
            }

            if ($DateEnd == "" or $DateEnd == null) {
                $DateEnd = date("Y-m-d 23:59");
            }

            // if email is not empty
            if ($skuuser != "" or $skuuser != null) {
               $current_sku_user_from_email = User::where('email', $skuuser)->get()->pluck('sku_user');
               $textSuffixUser = "pour l'utilisateur " . $skuuser;
               // convert email to sku_user
               $skuuser = $current_sku_user_from_email[0];
            }

            // default test account
            // $skuuser            = "";
            // $DateStart          = ""; // 2023-10-02
            // $DateEnd            = ""; // 2025-03-06

            /* return response()->json([
                "Message" => "Test",
                "skuuser" => $skuuser,
                "current_sku_user_from_email" => ,
            ]);
 */

            $retard_gains_non_obtenu  = 0;
            $existing_gain  = 0;
            $result_array   = [];
            $packagesInfos  = Package::where('status', "1")->get();

            $packages = [];
            for ($i = 0; $i < count($packagesInfos); $i++) {
                $packages[$packagesInfos[$i]['code']] = $packagesInfos[$i];
            }

            // interval des dates
            $period = new DatePeriod(
                new DateTime($DateStart),
                new DateInterval('P1D'),
                new DateTime($DateEnd)
            );

            foreach ($period as $key => $value) {
                // get the current date
                $current_date_en_format = $value->format('Y-m-d');

                // algo
                $usersCollection = null;
                if (isset($skuuser) && $skuuser != "") {
                    $usersCollection = User::with('subscriptions')
                        ->withSum([
                            'gains' => function ($query) use ($current_date_en_format) {
                                $query->whereBetween('created_at', [$current_date_en_format . ' 00:00:00', $current_date_en_format . ' 23:59:59']);
                            }
                        ], 'amount')
                        ->withSum('bonuses', 'amount')
                        ->withSum('transactionsReceived', 'amount')
                        ->withSum('transactionsSent', 'amount')
                        ->withSum([
                            'subscriptions' => function ($query) use ($current_date_en_format) {
                                $query->where('status', '=', "1");
                                $query->whereDate('created_at', '<', $current_date_en_format);
                            }
                        ], 'amount')
                        ->withSum([
                            'recharges' => function ($query) use ($current_date_en_format) {
                                $query->where('payment_method', '!=', 'Auto-Migré');
                                $query->whereDate('created_at', '<', $current_date_en_format);
                            }
                        ], 'amount')
                        ->where("sku_user", $skuuser)
                        ->get();
                } else {
                    // all users
                    $usersCollection = User::with('subscriptions')
                        ->withSum([
                            'gains' => function ($query) use ($current_date_en_format) {
                                $query->whereBetween('created_at', [$current_date_en_format . ' 00:00:00', $current_date_en_format . ' 23:59:59']);
                            }
                        ], 'amount')
                        ->withSum('bonuses', 'amount')
                        ->withSum('transactionsReceived', 'amount')
                        ->withSum('transactionsSent', 'amount')
                        ->withSum([
                            'subscriptions' => function ($query) use ($current_date_en_format) {
                                $query->where('status', '=', "1");
                                $query->whereDate('created_at', '<', $current_date_en_format);
                            }
                        ], 'amount')
                        ->withSum([
                            'recharges' => function ($query) use ($current_date_en_format) {
                                $query->where('payment_method', '!=', 'Auto-Migré');
                                $query->whereDate('created_at', '<', $current_date_en_format);
                            }
                        ], 'amount')
                        ->get();
                }

                foreach ($usersCollection as $user_key => $user) {

                    // check is user have subscription and also recharges on this date
                    if ($user->role == "super-admin" or $user->subscriptions_sum_amount == null or $user->recharges_sum_amount == null) {
                        continue;
                    }

                    // Get initial sum amount of all paid subscriptions
                    // $sum_amount_fullpaid_subscriptions = 0;
                    $sum_subscriptions_debt_amount = $user->subscriptions_sum_amount - $user->recharges_sum_amount;

                    // init user daily gain
                    $subscription_count = 0;
                    $subscription_partialy_paid_count = 0;
                    $subscription_expired_count = 0;
                    $sum_amount_collect_daily_gain = 0.0;
                    // le solde du portefeuiile virtuel est la difference entre les recharges et les abonnements deja payés
                    $current_wallet_balance_recharges = $user->recharges_sum_amount; // - $sum_amount_fullpaid_subscriptions);

                    // iterate investor subscriptions
                    for ($i = 0; $i < count($user->subscriptions); $i++) {

                        // Get pack informations
                        $subscription_pack_infos = $packages[$user->subscriptions[$i]->package_code];

                        // daily gain
                        $current_package_daily_gain = ($subscription_pack_infos->amount / 100) * $subscription_pack_infos->gain_daily;

                        // if all subscriptions are paid
                        if ($current_wallet_balance_recharges >= $subscription_pack_infos->amount) {

                            $subscription = Subscription::find($user->subscriptions[$i]->id);

                            // check date interval between gain start date and end date
                            if (is_null($subscription->paid_at)) {
                                // confirm that no premiew subscriptions dosen't have debt at this date before confirm
                                // the subscription to begin to get gain
                                // confirm payment of this current subscription

                                if ($sum_subscriptions_debt_amount > 0) {
                                    // another package debt exists
                                    continue;
                                }

                                $subscription->paid_at = date('Y-m-d', strtotime($current_date_en_format . ' - 1 days'));
                                $subscription->end_at  = date('Y-m-d', strtotime($current_date_en_format . ' + 364 days'));
                                $subscription->status  = 1;
                                $subscription->save();
                                // add daily gain
                                $sum_amount_collect_daily_gain += $current_package_daily_gain;
                            } elseif ($subscription->end_at > $current_date_en_format) {
                                // si la date finale est dans le futur par rapport a la date actuelle
                                // add daily gain
                                $sum_amount_collect_daily_gain += $current_package_daily_gain;
                            } else {
                                // 1 year is elapsed
                                $subscription->status = 0;
                                $subscription->save();
                            }

                            // remove the amount to the virtual wallet
                            $current_wallet_balance_recharges -= $subscription_pack_infos->amount;
                        } else {
                            // not completly paid subscription
                        }

                        // end of check subscriptions // we save daily sum amount of gains
                    }

                    if($sum_amount_collect_daily_gain<=0){
                        continue;
                    }

                    try {
                        // after collect all information, we send gain to user
                        // generate unique id
                        $nextGainID = 'G' . rand(1000000, 8000000) . $user->id . (date("dmYhis") + 1);
                        Gain::create([
                            'sku_user'          => $user->sku_user,
                            'sku_gain'          => $nextGainID,
                            'sku_user_origin'   => 'CBP-SYSTEM',
                            'reference'         => $current_date_en_format,
                            'designation'       => $user->id . "-DATE-" . $current_date_en_format,
                            'amount'            => $sum_amount_collect_daily_gain,
                            'period'            => $current_date_en_format,
                            'currency'          => "USD",
                            'status'            => 1,
                        ]);
                    } catch (Exception $exception) {
                        $existing_gain++;
                    }
                }
            }

            // ------------------------------------------------------------------

            $dateStartNoFormat = new DateTime($DateStart);

            return response()->json([
                "sku_user" => $skuuser,
                "sum_subscriptions_debt_amount" => $sum_subscriptions_debt_amount,
                "sum_amount_collect_daily_gain" => $sum_amount_collect_daily_gain,
                "result_array" => $result_array,
                "subscription_count" => $subscription_count,
                "existing_gain" => $existing_gain,
                "retard_gains_non_obtenu" => $retard_gains_non_obtenu,
                "subscription_partialy_paid_count" => $subscription_partialy_paid_count,
                "subscription_expired_count" => $subscription_expired_count,
                "data" => $usersCollection,
                "message" =>  "Gains octroyés pour le ". $dateStartNoFormat->format("d/m/Y")." ".$textSuffixUser
            ]);
        } catch (\Throwable $th) {
            throw $th;
        }
    }

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
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\GainAlgo  $gainAlgo
     * @return \Illuminate\Http\Response
     */
    public function show(GainAlgo $gainAlgo)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\GainAlgo  $gainAlgo
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, GainAlgo $gainAlgo)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\GainAlgo  $gainAlgo
     * @return \Illuminate\Http\Response
     */
    public function destroy(GainAlgo $gainAlgo)
    {
        //
    }
}
