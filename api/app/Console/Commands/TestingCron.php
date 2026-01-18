<?php

namespace App\Console\Commands;

use App\Http\Controllers\FunctionCollection;
use Illuminate\Console\Command;
use App\Models\Gain;
use App\Models\Package;
use App\Models\Subscription;
use App\Models\User;
use DateInterval;
use DatePeriod;
use DateTime;
use App\Http\Controllers\GainAlgoController;

class TestingCron extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    // protected $signature = 'testing:cron {date} {skuuser}';
    protected $signature = 'testing:cron {date?} {date2?}  {skuuser?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        // \Log::info("Testing Cron is Running ... !");
        $date = $this->argument('date');
        $date2 = $this->argument('date2');
        $skuuser = $this->argument('skuuser');
        $investorCount = 0;
        $text_repport = " || Rapport: ";

        // nouvel algo

        $gain_dispatch_action =  new GainAlgoController();
        $result_in_json = $gain_dispatch_action->executeSendGains($date, $date2, $skuuser);
        $text_repport = json_decode($result_in_json);

        // ------------------------------
        $this->info($text_repport);
        // ------------------------------

        // ancien algo
        return;

        // Write your database logic we bellow:
        // algo
        $usersCollection = null;
        if (isset($skuuser) && $skuuser != "") {
            $usersCollection = User::where("sku_user", $skuuser)->get();
        } else {
            $usersCollection =  User::all();
        }

        foreach ($usersCollection as $userKey => $userObject) {

            $sumOfInvestorGains = [];
            $nextGainID = '';

            # get package subscribed
            if ($userObject->role != "super-admin") {

                if (isset($date2) && $date2 != "" && $date2 != null) {


                    // interval des dates
                    $period = new DatePeriod(
                        new DateTime($date),
                        new DateInterval('P1D'),
                        new DateTime($date2)
                    );

                    foreach ($period as $key => $value) {

                        // get the current date
                        $current_date_en_format = $value->format('Y-m-d');


                        if ($date != "" or $current_date_en_format != "") {
                            // date is set dynamicaly
                            // get all subscriptions before defined $current_date_en_format
                            $mySubscriptions = Subscription::where(["sku_user" => $userObject->sku_user])
                                ->whereDate('created_at', '<', $current_date_en_format)
                                ->get();
                        } else {
                            // get all subscriptions of user // date("Y-m-d")
                            $mySubscriptions = Subscription::where(["sku_user" => $userObject->sku_user])
                                ->get();
                        }

                        // reinit
                        $eligibilitySumAmount = 0;

                        $dataCollect = new FunctionCollection();
                        $user_repport = $dataCollect->WalletBalance($userObject, null);


                        foreach ($mySubscriptions as $key => $subscriptionObject) {

                            // liste des souscriptions
                            $current_subscription_pack_code = $subscriptionObject->package_code;
                            $package_infos = Package::where(["code" => $current_subscription_pack_code])->first();
                            $package_price = $package_infos['amount'];
                            $package_daily_gain_percent = $package_infos['gain_daily'];
                            $subscription_id_ref = $subscriptionObject->id;

                            $sum_gains_current_investment = Gain::where([
                                'reference' => $package_infos['code'],
                                'sku_user' => $userObject->sku_user
                            ])
                                ->sum("amount");

                            $total_gain_recu_par_pack = Gain::where([
                                'reference' => $package_infos['code'],
                                'sku_user' => $userObject->sku_user
                            ])->count();

                            $sum_gain_per_cycle = ($package_infos['amount'] + $package_infos['gain_annual']);

                            // inscrement sum eligibility
                            $eligibilitySumAmount += $package_price;

                            //if ($total_gain_recu_par_pack < 365) {
                            if ($sum_gains_current_investment < $sum_gain_per_cycle) {
                                // si le membre est elligible
                                // si linvestisseur a ete migre et qu'il est vip-1
                                if ($user_repport['investType'] == "Migré" and $package_infos['code'] == "VIP-1") {
                                    // on bloque les gains
                                    $text_repport .= "Migré : " . $userObject->email . " [[ " . $package_infos['code']  . "]] \n"; // $userObject->email . "=" . $user_repport['total_recharge_pack_actuel'] . " : " . $eligibilitySumAmount;
                                    // continue;
                                } else {
                                    // if sum recharge >= $eligibilitySumAmount // the investor can gain this package
                                    // if the sum of all recharges of pack are < eligibilitySumAmount
                                    if ($user_repport['total_recharge_pack_actuel'] < $eligibilitySumAmount) {
                                        // continue to next
                                        $text_repport .=  "Dette payement pack : " . $userObject->email  . "\n";
                                    } else {
                                        // add gain to user
                                        // check next id
                                        $datePosted = new DateTime($current_date_en_format);
                                        $nextGainID = 'GJ' . $datePosted->format("dmy") . (count(Gain::all()) + 1);

                                        // check if gain not already registered
                                        $existingSubscriptionGain = Gain::where([
                                            'period' => $current_date_en_format,
                                            'reference' => $package_infos['code'],
                                            'sku_user' => $userObject->sku_user
                                        ])
                                            ->whereDate('created_at', '<=', $current_date_en_format)
                                            ->get();

                                        try {
                                            if (count($existingSubscriptionGain) <= 0) {
                                                // gain dosen't exists
                                                if ($current_date_en_format != "" or $current_date_en_format != null) {
                                                    // $current_date_en_format absent dans le tableau
                                                    if (!array_key_exists($current_date_en_format, $sumOfInvestorGains)) {
                                                        $sumOfInvestorGains[$current_date_en_format] = ($package_price / 100) * $package_daily_gain_percent;
                                                    } else {
                                                        $sumOfInvestorGains[$current_date_en_format] += ($package_price / 100) * $package_daily_gain_percent;
                                                    }

                                                    Gain::create([
                                                        'sku_user' => $userObject->sku_user,
                                                        'sku_gain' => 'GJ' . $nextGainID,
                                                        'sku_user_origin' => 'CBP-SYSTEM',
                                                        'reference' => $package_infos['code'],
                                                        'designation' => $current_date_en_format . "--" . $package_infos['code'] . "-ID-" . $subscription_id_ref,
                                                        'amount' => ($package_price / 100) * $package_daily_gain_percent,
                                                        'period' => $current_date_en_format,
                                                        'currency' => "USD",
                                                        'status' => 1,
                                                    ]);
                                                } else {
                                                    // not filtered
                                                    // date absent dans le tableau
                                                    if (!array_key_exists($current_date_en_format, $sumOfInvestorGains)) {
                                                        $sumOfInvestorGains[$current_date_en_format] = ($package_price / 100) * $package_daily_gain_percent;
                                                    } else {
                                                        $sumOfInvestorGains[$current_date_en_format] += ($package_price / 100) * $package_daily_gain_percent;
                                                    }
                                                    Gain::create([
                                                        'sku_user' => $userObject->sku_user,
                                                        'sku_gain' => 'GJ' . $nextGainID,
                                                        'sku_user_origin' => 'CBP-SYSTEM',
                                                        'reference' => $package_infos['code'],
                                                        'designation' => $current_date_en_format . "--" . $package_infos['code'] . "-ID-" . $subscription_id_ref,
                                                        'amount' => ($package_price / 100) * $package_daily_gain_percent,
                                                        'period' => $current_date_en_format,
                                                        'currency' => "USD",
                                                        'status' => 1,
                                                    ]);
                                                }

                                                $investorCount++;
                                            } else {
                                                // verification si le pack n'est pas souscrit a plusieurs reprise
                                                // nouveaux gains , enregistrés après cette mise à niveau du systeme
                                                if ($existingSubscriptionGain[0]["designation"] != null) {
                                                    // gain doesn't exists
                                                    if ($current_date_en_format != "" or $current_date_en_format != null) {
                                                        // date is set manualy
                                                        // date absent dans le tableau
                                                        if (!array_key_exists($current_date_en_format, $sumOfInvestorGains)) {
                                                            $sumOfInvestorGains[$current_date_en_format] = ($package_price / 100) * $package_daily_gain_percent;
                                                        } else {
                                                            $sumOfInvestorGains[$current_date_en_format] += ($package_price / 100) * $package_daily_gain_percent;
                                                        }
                                                        Gain::create([
                                                            'sku_user' => $userObject->sku_user,
                                                            'sku_gain' => 'GJ' . $nextGainID,
                                                            'sku_user_origin' => 'CBP-SYSTEM',
                                                            'reference' => $package_infos['code'],
                                                            'designation' => $current_date_en_format . "--" . $package_infos['code'] . "-ID-" . $subscription_id_ref,
                                                            'amount' => ($package_price / 100) * $package_daily_gain_percent,
                                                            'period' => $current_date_en_format,
                                                            'currency' => "USD",
                                                            'status' => 1,
                                                        ]);
                                                    } else {
                                                        // not filtered
                                                        // date absent dans le tableau
                                                        if (!array_key_exists($current_date_en_format, $sumOfInvestorGains)) {
                                                            $sumOfInvestorGains[$current_date_en_format] = ($package_price / 100) * $package_daily_gain_percent;
                                                        } else {
                                                            $sumOfInvestorGains[$current_date_en_format] += ($package_price / 100) * $package_daily_gain_percent;
                                                        }
                                                        Gain::create([
                                                            'sku_user' => $userObject->sku_user,
                                                            'sku_gain' => 'GJ' . $nextGainID,
                                                            'sku_user_origin' => 'CBP-SYSTEM',
                                                            'reference' => $package_infos['code'],
                                                            'designation' => $current_date_en_format . "--" . $package_infos['code'] . "-ID-" . $subscription_id_ref,
                                                            'amount' => ($package_price / 100) * $package_daily_gain_percent,
                                                            'period' => $current_date_en_format,
                                                            'currency' => "USD",
                                                            'status' => 1,
                                                        ]);
                                                    }

                                                    $investorCount++;
                                                } else {
                                                    // anciens gains
                                                    // continue
                                                    $text_repport .= ' >> Gain existe: ' . $userObject->email . "\n";
                                                }
                                            }
                                        } catch (\Throwable $th) {
                                            //throw $th;
                                            $text_repport .= $th . "\n";
                                        }
                                    }
                                }
                            } else {
                                // user cannot have/receive daily gains
                                // if ($userObject->email == "athanasekakule3@gmail.com") {
                                // $text_repport .= 'Pack Code : ' . $package_infos['code'] . " Deja recu: " . $sum_gains_current_investment . " sur Total Gen: " . $sum_gain_per_cycle . "\n";
                                // } else {
                                //
                                // }
                            }
                            //} else {
                            // si les 365 jours du pack sont écoulés
                            // $text_repport .= $userObject->username. ' : ' . 'Pack Code : ' . $package_infos['code'] .  " jours total octroyé : " .$total_gain_recu_par_pack. " | Calcul des gains: " . $sum_gains_current_investment . " >> " . $sum_gain_per_cycle  . "\n";
                            //}
                        }
                    }
                } else {

                    if ($date != "" or $date != null) {
                        // date is set manualy
                        // get all subscriptions before defined date
                        $mySubscriptions = Subscription::where(["sku_user" => $userObject->sku_user])
                            ->whereDate('created_at', '<', $date)
                            ->get();
                    } else {
                        // get all subscriptions of user // date("Y-m-d")
                        $mySubscriptions = Subscription::where(["sku_user" => $userObject->sku_user])
                            ->get();
                    }

                    // reinit
                    $eligibilitySumAmount = 0;

                    $dataCollect = new FunctionCollection();
                    $user_repport = $dataCollect->WalletBalance($userObject, null);

                    // ----------------------------------------------------------------------------------
                    // ----------------------------------------------------------------------------------
                    // ----------------------------------------------------------------------------------
                    // one date // seulement une date defini
                    foreach ($mySubscriptions as $key => $subscriptionObject) {

                        // liste des souscriptions
                        $current_subscription_pack_code = $subscriptionObject->package_code;
                        $package_infos = Package::where(["code" => $current_subscription_pack_code])->first();
                        $package_price = $package_infos['amount'];
                        $package_daily_gain_percent = $package_infos['gain_daily'];
                        $subscription_id_ref = $subscriptionObject->id;

                        $sum_gains_current_investment = Gain::where([
                            'reference' => $package_infos['code'],
                            'sku_user' => $userObject->sku_user
                        ])
                            ->sum("amount");

                        $total_gain_recu_par_pack = Gain::where([
                            'reference' => $package_infos['code'],
                            'sku_user' => $userObject->sku_user
                        ])->count();

                        $sum_gain_per_cycle = ($package_infos['amount'] + $package_infos['gain_annual']);

                        // inscrement sum eligibility
                        $eligibilitySumAmount += $package_price;

                        //if ($total_gain_recu_par_pack < 365) {
                        if ($sum_gains_current_investment < $sum_gain_per_cycle) {
                            // si le membre est elligible
                            // si linvestisseur a ete migre et qu'il est vip-1
                            if ($user_repport['investType'] == "Migré" and $package_infos['code'] == "VIP-1") {
                                // on bloque les gains
                                $text_repport .= "Migré : " . $userObject->email . " [[ " . $package_infos['code']  . "]] \n"; // $userObject->email . "=" . $user_repport['total_recharge_pack_actuel'] . " : " . $eligibilitySumAmount;
                                // continue;
                            } else {
                                // if sum recharge >= $eligibilitySumAmount // the investor can gain this package
                                // if the sum of all recharges of pack are < eligibilitySumAmount
                                if ($user_repport['total_recharge_pack_actuel'] < $eligibilitySumAmount) {
                                    // continue to next
                                    $text_repport .=  "Dette payement pack : " . $userObject->email  . "\n";
                                } else {
                                    // add gain to user
                                    // check next id
                                    $datePosted = new DateTime($date);
                                    $nextGainID = 'GJ' . $datePosted->format("dmy") . (count(Gain::all()) + 1);

                                    // check if gain not already registered
                                    if ($date != "" or $date != null) {
                                        // date is set manualy
                                        $existingSubscriptionGain = Gain::where([
                                            'period' => $date,
                                            'reference' => $package_infos['code'],
                                            'sku_user' => $userObject->sku_user
                                        ])
                                            ->whereDate('created_at', '<=', $date)
                                            ->get();
                                    } else {
                                        // not filtered by date
                                        $existingSubscriptionGain = Gain::where([
                                            'period' => date("Y-m-d"),
                                            'reference' => $package_infos['code'],
                                            'sku_user' => $userObject->sku_user
                                        ])->get();
                                    }

                                    try {
                                        if (count($existingSubscriptionGain) <= 0) {
                                            // gain dosen't exists
                                            if ($date != "" or $date != null) {
                                                // date absent dans le tableau
                                                if (!array_key_exists($date, $sumOfInvestorGains)) {
                                                    $sumOfInvestorGains[$date] = ($package_price / 100) * $package_daily_gain_percent;
                                                } else {
                                                    $sumOfInvestorGains[$date] += ($package_price / 100) * $package_daily_gain_percent;
                                                }

                                                Gain::create([
                                                    'sku_user' => $userObject->sku_user,
                                                    'sku_gain' => 'GJ' . $nextGainID,
                                                    'sku_user_origin' => 'CBP-SYSTEM',
                                                    'reference' => $package_infos['code'],
                                                    'designation' => $date . "--" . $package_infos['code'] . "-ID-" . $subscription_id_ref,
                                                    'amount' => ($package_price / 100) * $package_daily_gain_percent,
                                                    'period' => $date,
                                                    'currency' => "USD",
                                                    'status' => 1,
                                                ]);
                                            } else {
                                                // not filtered
                                                // date absent dans le tableau
                                                if (!array_key_exists(date("Y-m-d"), $sumOfInvestorGains)) {
                                                    $sumOfInvestorGains[date("Y-m-d")] = ($package_price / 100) * $package_daily_gain_percent;
                                                } else {
                                                    $sumOfInvestorGains[date("Y-m-d")] += ($package_price / 100) * $package_daily_gain_percent;
                                                }
                                                Gain::create([
                                                    'sku_user' => $userObject->sku_user,
                                                    'sku_gain' => 'GJ' . $nextGainID,
                                                    'sku_user_origin' => 'CBP-SYSTEM',
                                                    'reference' => $package_infos['code'],
                                                    'designation' => date("Y-m-d") . "--" . $package_infos['code'] . "-ID-" . $subscription_id_ref,
                                                    'amount' => ($package_price / 100) * $package_daily_gain_percent,
                                                    'period' => date("Y-m-d"),
                                                    'currency' => "USD",
                                                    'status' => 1,
                                                ]);
                                            }

                                            $investorCount++;
                                        } else {
                                            // verification si le pack n'est pas souscrit a plusieurs reprise
                                            // nouveaux gains , enregistrés après cette mise à niveau du systeme
                                            if ($existingSubscriptionGain[0]["designation"] != null) {
                                                // gain doesn't exists
                                                if ($date != "" or $date != null) {
                                                    // date is set manualy
                                                    // date absent dans le tableau
                                                    if (!array_key_exists($date, $sumOfInvestorGains)) {
                                                        $sumOfInvestorGains[$date] = ($package_price / 100) * $package_daily_gain_percent;
                                                    } else {
                                                        $sumOfInvestorGains[$date] += ($package_price / 100) * $package_daily_gain_percent;
                                                    }
                                                    Gain::create([
                                                        'sku_user' => $userObject->sku_user,
                                                        'sku_gain' => 'GJ' . $nextGainID,
                                                        'sku_user_origin' => 'CBP-SYSTEM',
                                                        'reference' => $package_infos['code'],
                                                        'designation' => $date . "--" . $package_infos['code'] . "-ID-" . $subscription_id_ref,
                                                        'amount' => ($package_price / 100) * $package_daily_gain_percent,
                                                        'period' => $date,
                                                        'currency' => "USD",
                                                        'status' => 1,
                                                    ]);
                                                } else {
                                                    // not filtered
                                                    // date absent dans le tableau
                                                    if (!array_key_exists(date("Y-m-d"), $sumOfInvestorGains)) {
                                                        $sumOfInvestorGains[date("Y-m-d")] = ($package_price / 100) * $package_daily_gain_percent;
                                                    } else {
                                                        $sumOfInvestorGains[date("Y-m-d")] += ($package_price / 100) * $package_daily_gain_percent;
                                                    }
                                                    Gain::create([
                                                        'sku_user' => $userObject->sku_user,
                                                        'sku_gain' => 'GJ' . $nextGainID,
                                                        'sku_user_origin' => 'CBP-SYSTEM',
                                                        'reference' => $package_infos['code'],
                                                        'designation' => date("Y-m-d") . "--" . $package_infos['code'] . "-ID-" . $subscription_id_ref,
                                                        'amount' => ($package_price / 100) * $package_daily_gain_percent,
                                                        'period' => date("Y-m-d"),
                                                        'currency' => "USD",
                                                        'status' => 1,
                                                    ]);
                                                }

                                                $investorCount++;
                                            } else {
                                                // anciens gains
                                                // continue
                                                $text_repport .= ' >> Gain existe: ' . $userObject->email . "\n";
                                            }
                                        }
                                    } catch (\Throwable $th) {
                                        //throw $th;
                                        $text_repport .= $th . "\n";
                                    }
                                }
                            }
                        } else {
                            // user cannot have/receive daily gains
                            // if ($userObject->email == "athanasekakule3@gmail.com") {
                            // $text_repport .= 'Pack Code : ' . $package_infos['code'] . " Deja recu: " . $sum_gains_current_investment . " sur Total Gen: " . $sum_gain_per_cycle . "\n";
                            // } else {
                            //
                            // }
                        }
                        //} else {
                        // si les 365 jours du pack sont écoulés
                        // $text_repport .= $userObject->username. ' : ' . 'Pack Code : ' . $package_infos['code'] .  " jours total octroyé : " .$total_gain_recu_par_pack. " | Calcul des gains: " . $sum_gains_current_investment . " >> " . $sum_gain_per_cycle  . "\n";
                        //}
                    }
                }
            }

            // fin bouble utilisateur on octroie un seul gain (sommation de tous les investissements)
            /* Gain::create([
                'sku_user' => $userObject->sku_user,
                'sku_gain' => $nextGainID,
                'sku_user_origin' => 'CBP-SYSTEM',
                'reference' => $package_infos['code'],
                'designation' => $date_gain . "--" . $package_infos['code'] . "-ID-" . $subscription_id_ref,
                'amount' => ($package_price / 100) * $package_daily_gain_percent,
                'period' => $date_gain,
                'currency' => "USD",
                'status' => 1,
            ]); */
        }

        // convert to french date
        if ($date != "" or $date != null) {
            $date = date("d-m-Y", strtotime($date));
        } else {
            $date = date("d-m-Y");
        }

        if ($investorCount > 0) {
            if ($date != "" && $date != null && $skuuser != "") {
                $this->info('Les gains ont été bien accordés à l\'investisseur: ' . $skuuser . ' | en Date: ' . $date);
            } elseif ($date != "") {
                $this->info('Les gains ont été bien accordés à ' . $investorCount . ' investisseurs | Date: ' . $date);
            } else {
                $this->info('Les gains ont été bien accordés à ' . $investorCount . ' investisseurs | Période: ' . date("d-m-Y à h:i"));
            }
        } else {
            $this->info('Les gains n\'ont pas été bien accordés || ' . $text_repport);
        }
        // ------------------------------
        $this->info($text_repport);
        // ------------------------------
    }
}
