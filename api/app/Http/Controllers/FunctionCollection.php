<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\User;
use App\Models\Gain;
use App\Models\Bonus;
use App\Models\Investor;
use App\Models\Package;
use App\Models\Parring;
use App\Models\Transaction;
use App\Models\Recharge;
use Error;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Throwable;

class FunctionCollection extends Controller
{
    public function AmountFormat($amount)
    {
        if ($amount <= 1) {
            return number_format((float)$amount, 3, ',', '');
        } else {
            return number_format((float)$amount, 1, ',', '');
        }
    }

    /* public function PackageGainEligibilityTest($user, $sumRecharges, $packages)
    {
        if ($amount <= 1) {
            return number_format((float)$amount, 3, ',', '');
        } else {
            return number_format((float)$amount, 1, ',', '');
        }
    } */

    public function WalletBalance($user = null, $date = null)
    {
        // try {
        if ($user == false) {
            // check if user exists and logged in
            if (!$user = auth()->user()) {
                throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
            }
        } else {
            // background job
        }

        try {

            $sku_user = $user->sku_user;

            if($date!=null){
                $sommeGains =  Gain::selectRaw('sum(amount) AS sommeGains')
                ->whereDate('created_at', '<', $date)
                ->where(["sku_user" => $sku_user, "status" => 1])
                ->get()->toArray();
            }else{
                $sommeGains =  Gain::selectRaw('sum(amount) AS sommeGains')
                ->where(["sku_user" => $sku_user, "status" => 1])
                ->get()->toArray();
            }

            if($date!=null){
                $totaJoursGains =  Gain::selectRaw('count(amount) AS totalGains')
                ->whereDate('created_at', '<', $date)
                ->where(["sku_user" => $sku_user, "status" => 1])
                ->get()->toArray();
            }else{
                $totaJoursGains =  Gain::selectRaw('count(amount) AS totalGains')
                ->where(["sku_user" => $sku_user, "status" => 1])
                ->get()->toArray();
            }

            if($date!=null){
                $sommeBonus =  Bonus::selectRaw('sum(amount) AS sommeBonus')
                ->whereDate('created_at', '<', $date)
                ->where(["sku_user" => $sku_user, "status" => 1])
                ->get();
            }else{
                $sommeBonus =  Bonus::selectRaw('sum(amount) AS sommeBonus')
                ->where(["sku_user" => $sku_user, "status" => 1])
                ->get();
            }

            if($date!=null){
                $totalTransactionsRetrait = Transaction::selectRaw('sum(amount) AS totalRetrait')
                ->whereDate('created_at', '<', $date)
                ->where(["sku_user" => $sku_user, "status" => 1, "type" => 'RETRAIT'])
                ->get();
            }else{
                $totalTransactionsRetrait = Transaction::selectRaw('sum(amount) AS totalRetrait')
                ->where(["sku_user" => $sku_user, "status" => 1, "type" => 'RETRAIT'])
                ->get();
            }

            if($date!=null){
                 $totalTransactionsFraisRetrait = Transaction::selectRaw('sum(amount) AS totalFraisRetrait')
                ->whereDate('created_at', '<', $date)
                ->where(["sku_user" => $sku_user, "status" => 1, "type" => 'FRAIS-RETRAIT'])
                ->get();
            }else{
                 $totalTransactionsFraisRetrait = Transaction::selectRaw('sum(amount) AS totalFraisRetrait')
                ->where(["sku_user" => $sku_user, "status" => 1, "type" => 'FRAIS-RETRAIT'])
                ->get();
            }

            if($date!=null){
                $totalTransactionsTransfert = Transaction::selectRaw('sum(amount) AS totalTransfert')
                ->whereDate('created_at', '<', $date)
                ->where(["sku_user" => $sku_user, "status" => 1, "type" => 'TRANSFERT'])
                ->get();
            }else{
                $totalTransactionsTransfert = Transaction::selectRaw('sum(amount) AS totalTransfert')
                ->where(["sku_user" => $sku_user, "status" => 1, "type" => 'TRANSFERT'])
                ->get();
            }

            if($date!=null){
                $totalTransactionsTransfertReceived = Transaction::selectRaw('sum(amount) AS totalTransfertReceived')
                ->whereDate('created_at', '<', $date)
                ->where(["sku_user_destination" => $sku_user, "status" => 1, "type" => 'TRANSFERT'])
                ->get();
            }else{
                $totalTransactionsTransfertReceived = Transaction::selectRaw('sum(amount) AS totalTransfertReceived')
                ->where(["sku_user_destination" => $sku_user, "status" => 1, "type" => 'TRANSFERT'])
                ->get();
            }

            if($date!=null){
                $mySubscriptions = Subscription::where(["sku_user" => $user->sku_user])
                ->whereDate('created_at', '<', $date)
                ->get();
            }else{
                $mySubscriptions = Subscription::where(["sku_user" => $user->sku_user])
                ->get();
            }

            if($date!=null){
                $totalRechargeCurrentPackSubscription = Recharge::selectRaw('sum(amount) AS totalRecharge')
                ->whereDate('created_at', '<', $date)
                ->where(["sku_user" => $sku_user, "status" => 1]) // , "package_code" => $user->role
                ->get();
            }else{
                $totalRechargeCurrentPackSubscription = Recharge::selectRaw('sum(amount) AS totalRecharge')
                ->where(["sku_user" => $sku_user, "status" => 1]) // , "package_code" => $user->role
                ->get();
            }

            if($date!=null){
                $countRechargeCurrentPackSubscription = Recharge::selectRaw('count(amount) AS countRecharge')
                ->whereDate('created_at', '<', $date)
                ->where(["sku_user" => $sku_user, "status" => 1]) // , "package_code" => $user->role
                ->get();
            }else{
                $countRechargeCurrentPackSubscription = Recharge::selectRaw('count(amount) AS countRecharge')
                ->where(["sku_user" => $sku_user, "status" => 1]) // , "package_code" => $user->role
                ->get();
            }

            if($date!=null){
                $sumInternalRechargeCurrentPackSubscription = Recharge::selectRaw('sum(amount) AS sumInternalRecharge')
                ->whereDate('created_at', '<', $date)
                ->where(["sku_user" => $sku_user, "status" => 1, "payment_method" => "MON-SOLDE"]) // "package_code" => $user->role,
                ->get();
            }else{
                 $sumInternalRechargeCurrentPackSubscription = Recharge::selectRaw('sum(amount) AS sumInternalRecharge')
                ->where(["sku_user" => $sku_user, "status" => 1, "payment_method" => "MON-SOLDE"]) // "package_code" => $user->role,
                ->get();
            }

            if($date!=null){
               $countParredChilds = Parring::selectRaw('sum(child) AS myChilds')
                ->whereDate('created_at', '<', $date)
                ->where(["sku_user_parent" => $sku_user, "status" => 1])
                ->get();
            }else{
                $countParredChilds = Parring::selectRaw('sum(child) AS myChilds')
                ->where(["sku_user_parent" => $sku_user, "status" => 1])
                ->get();
            }

            $investorDataInfos = Investor::selectRaw('stop_gain AS stopGain, type as investType')
                ->where(["sku_user" => $sku_user])
                ->get();


            $total_invite = 0.0;
            $balance = 0.0;
            $somme_bonus = 0.0;
            $somme_gain = 0.0;
            $total_retrait = 0.0;
            $total_frais_retrait = 0.0;
            $total_transfert = 0.0;
            $total_transfert_received = 0.0;
            $total_internal_recharge_pack_actuel = 0.0;
            $total_recharge_pack_actuel = 0.0;
            $count_recharge_pack_actuel = 0;
            $dette_restante_achat_packet = 0.0;
            $total_invite = 1;
            $total_gain = 0;

            if (isset($sommeGains[0]["sommeGains"]) && $sommeGains[0]["sommeGains"] > 0) {
                $balance += $sommeGains[0]["sommeGains"];
                $somme_gain = $sommeGains[0]["sommeGains"];
            }
            // some gains
            if (isset($totaJoursGains[0]["totalGains"]) && $totaJoursGains[0]["totalGains"] >= 0) {
                $total_gain = $totaJoursGains[0]["totalGains"];
            }
            // some bonus
            if (isset($sommeBonus[0]["sommeBonus"]) && $sommeBonus[0]["sommeBonus"] > 0) {
                $balance += $sommeBonus[0]["sommeBonus"];
                $somme_bonus = $sommeBonus[0]["sommeBonus"];
            }
            // total retrait
            if (isset($totalTransactionsRetrait[0]["totalRetrait"]) && $totalTransactionsRetrait[0]["totalRetrait"] > 0) {
                $balance -= $totalTransactionsRetrait[0]["totalRetrait"];
                $total_retrait = $totalTransactionsRetrait[0]["totalRetrait"];
            }
            // total frais retrait
            if (isset($totalTransactionsFraisRetrait[0]["totalFraisRetrait"]) && $totalTransactionsFraisRetrait[0]["totalFraisRetrait"] > 0) {
                $balance -= $totalTransactionsFraisRetrait[0]["totalFraisRetrait"];
                $total_frais_retrait = $totalTransactionsFraisRetrait[0]["totalFraisRetrait"];
            }
            // total somme transfert sortant
            if (isset($totalTransactionsTransfert[0]["totalTransfert"]) && $totalTransactionsTransfert[0]["totalTransfert"] > 0) {
                $balance -= $totalTransactionsTransfert[0]["totalTransfert"];
                $total_transfert = $totalTransactionsTransfert[0]["totalTransfert"];
            }
            // total somme transfert entrant
            if (isset($totalTransactionsTransfertReceived[0]["totalTransfertReceived"]) && $totalTransactionsTransfertReceived[0]["totalTransfertReceived"] > 0) {
                $balance += $totalTransactionsTransfertReceived[0]["totalTransfertReceived"];
                $total_transfert_received = $totalTransactionsTransfertReceived[0]["totalTransfertReceived"];
            }
            // total recharge
            if (isset($totalRechargeCurrentPackSubscription[0]["totalRecharge"]) && $totalRechargeCurrentPackSubscription[0]["totalRecharge"] > 0) {
                $total_recharge_pack_actuel = $totalRechargeCurrentPackSubscription[0]["totalRecharge"];
            }
            // total internal recharge
            if (isset($sumInternalRechargeCurrentPackSubscription[0]["sumInternalRecharge"]) && $sumInternalRechargeCurrentPackSubscription[0]["sumInternalRecharge"] > 0) {
                $balance -= $sumInternalRechargeCurrentPackSubscription[0]["sumInternalRecharge"];
                $total_internal_recharge_pack_actuel = $sumInternalRechargeCurrentPackSubscription[0]["sumInternalRecharge"];
            }
            // count total recharge
            if (isset($countRechargeCurrentPackSubscription[0]["countRecharge"]) && $countRechargeCurrentPackSubscription[0]["countRecharge"] > 0) {
                $count_recharge_pack_actuel = $countRechargeCurrentPackSubscription[0]["countRecharge"];
            }
            // total parraines
            if (isset($countParredChilds[0]["myChilds"]) && $countParredChilds[0]["myChilds"] > 0) {
                $total_invite = $countParredChilds[0]["myChilds"];
            } else {
                $total_invite = 0;
            }

            // stop gain
            // si stop gain est defini on recupere la valeur
            if (isset($investorDataInfos[0]["stopGain"]) && $investorDataInfos[0]["stopGain"] >= 0) {
                $stopGain = $investorDataInfos[0]["stopGain"];
                $investType = $investorDataInfos[0]["investType"];
            }else{
                $stopGain = 1;
                $investType = "Migré";
            }

            // prix du package - total des recharge externe du pack - total recharge interne;
            $totalSommeDesDepots = (float)($total_recharge_pack_actuel); //+ $total_internal_recharge_pack_actuel

            $can_download_files = false;
            $allPackagesSumPrice = 0;
            $packSouscrits= "";
            $index = 0;

            $sumSubscriptionPayments =  $totalSommeDesDepots + $total_internal_recharge_pack_actuel;

            foreach ($mySubscriptions as $key => $subscriptionObject) {

                $pack_code = $subscriptionObject->package_code;
                $currentPackagePrice = Package::where(["code" => $pack_code])->pluck('amount')[0];
                $allPackagesSumPrice += $currentPackagePrice;

                // check if user can download files
                if($sumSubscriptionPayments >= $currentPackagePrice){
                    // user can download files
                    $can_download_files = true;
                }

                if($index==0){
                    $packSouscrits .= $pack_code;
                }else{
                    $packSouscrits .= " | " . $pack_code;
                }

                $index++;

            }

            $prix_package = $allPackagesSumPrice;

            $dette_restante_achat_packet = $prix_package - $totalSommeDesDepots;

            // Calcul des gains journaliers (aujourd'hui vs hier)
            $gainsToday = Gain::selectRaw('sum(amount) AS total')
                ->whereDate('created_at', '=', now()->toDateString())
                ->where(["sku_user" => $sku_user, "status" => 1])
                ->value('total') ?? 0;

            $gainsYesterday = Gain::selectRaw('sum(amount) AS total')
                ->whereDate('created_at', '=', now()->subDay()->toDateString())
                ->where(["sku_user" => $sku_user, "status" => 1])
                ->value('total') ?? 0;

            // Calcul du pourcentage de changement
            $gainsChange = 0;
            if ($gainsYesterday > 0) {
                $gainsChange = round((($gainsToday - $gainsYesterday) / $gainsYesterday) * 100, 2);
            } elseif ($gainsToday > 0) {
                $gainsChange = 100; // Si hier = 0 et aujourd'hui > 0, c'est +100%
            }

            // Distribution des investisseurs par type de package
            $packageDistribution = \DB::table('subscriptions')
                ->select('package_code', \DB::raw('count(*) as count'))
                ->groupBy('package_code')
                ->get()
                ->map(function($item) {
                    return [
                        'name' => $item->package_code,
                        'value' => $item->count
                    ];
                })
                ->toArray();

            // Evolution des gains (Mois en cours)
            $gainsEvolution = [];
            $startOfMonth = now()->startOfMonth();
            $daysInMonth = now()->daysInMonth;

            for ($i = 0; $i < $daysInMonth; $i++) {
                $date = $startOfMonth->copy()->addDays($i);
                $dayLabel = $date->format('d');

                // User Gains
                $dailyGain = Gain::whereDate('created_at', $date->toDateString())
                    ->where(["sku_user" => $sku_user, "status" => 1])
                    ->sum('amount');

                // System Gains (Fees paid by user)
                $dailySystemGain = Transaction::whereDate('created_at', $date->toDateString())
                    ->where(["sku_user" => $sku_user, "status" => 1, "type" => "FRAIS-RETRAIT"])
                    ->sum('amount');

                $gainsEvolution[] = [
                    'name' => $dayLabel,
                    'gains' => (float)$dailyGain,
                    'system' => (float)$dailySystemGain
                ];
            }

            return [
                "debt_message" => "vous n'etes pas totalement en ordre, il vous reste " . $this->AmountFormat($dette_restante_achat_packet) . "$ à payer pour bénéficier de tous les avantages",
                "show_debt_message" => $dette_restante_achat_packet > 0 ? true : false,
                "wallet_balance" => $this->AmountFormat($balance),
                "dette_restante_achat_packet" => $this->AmountFormat($dette_restante_achat_packet),
                "dette_restante_achat_packet_nonformatee" => $dette_restante_achat_packet,
                "total_invite" => $total_invite,
                "balance" => $this->AmountFormat($balance),
                "balanceAmount" => $balance,
                "somme_gain" =>  $this->AmountFormat($somme_gain),
                "somme_bonus" => $this->AmountFormat($somme_bonus),
                "total_retrait" => $this->AmountFormat($total_retrait),
                "total_frais_retrait" => $this->AmountFormat($total_frais_retrait),
                "total_transfert" => $this->AmountFormat($total_transfert),
                "total_transfert_received" => $this->AmountFormat($total_transfert_received),
                "total_internal_recharge_pack_actuel" => $this->AmountFormat($total_internal_recharge_pack_actuel),
                "total_recharge_pack_actuel" => $totalSommeDesDepots,
                "total_subscription_pack_actuel" => $totalSommeDesDepots + $total_internal_recharge_pack_actuel,
                "count_recharge_pack_actuel" => $count_recharge_pack_actuel,
                "total_gain" => $total_gain,
                "stopGain" => $stopGain,
                "investType" => $investType,
                "prix_package" => $prix_package,
                "subscriptions" => $packSouscrits, //$prix_package
                "can_download_files" => $can_download_files,
                "gains_today" => $this->AmountFormat($gainsToday) . " $",
                "gains_yesterday" => $this->AmountFormat($gainsYesterday) . " $",
                "gains_change" => $gainsChange,
                "package_distribution" => $packageDistribution,
                "gains_evolution" => $gainsEvolution,
            ];
        } catch (Error $e) {
            // do something when exception is thrown
            return [
                "exc_err" => $e,
                "debt_message" => "-",
                "show_debt_message" => "-",
                "wallet_balance" => "-",
                "dette_restante_achat_packet" => "-",
                "dette_restante_achat_packet_nonformatee" => 0,
                "total_invite" => "-",
                "balance" => "-",
                "balanceAmount" => "-",
                "somme_gain" =>  "-",
                "somme_bonus" => "-",
                "total_retrait" => "-",
                "total_transfert" => "-",
                "total_frais_retrait" => "-",
                "total_transfert_received" => "-",
                "total_recharge_pack_actuel" => "-",
                "total_internal_recharge_pack_actuel" => "-",
                "total_subscription_pack_actuel" => "-",
                "count_recharge_pack_actuel" => 365,
                "total_gain" => "-",
                "stopGain" => 1,
                "investType" => "Migré",
                "prix_package" => "-",
                "subscriptions" => "",
                "can_download_files" => false,
            ];
        } catch (Throwable $th) {
            // do something when Throwable is thrown
            return [
                "error" => $th->__toString(),
                "debt_message" => "-",
                "show_debt_message" => "-",
                "wallet_balance" => "-",
                "dette_restante_achat_packet" => "-",
                "dette_restante_achat_packet_nonformatee" => 0,
                "total_invite" => "-",
                "balance" => "-",
                "balanceAmount" => "-",
                "somme_gain" =>  "-",
                "somme_bonus" => "-",
                "total_retrait" => "-",
                "total_frais_retrait" => "-",
                "total_transfert" => "-",
                "total_transfert_received" => "-",
                "total_recharge_pack_actuel" => "-",
                "total_internal_recharge_pack_actuel" => "-",
                "count_recharge_pack_actuel" => 365,
                "total_gain" => "-",
                "stopGain" => 1,
                "investType" => "Migré",
                "prix_package" => "-",
                "subscriptions" => "",
                "can_download_files" => false,
            ];
        }
    }
}
