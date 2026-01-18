<?php

namespace App\Http\Controllers;

use App\Http\Controllers\FunctionCollection;
use App\Models\Bonus;
use App\Models\Branch;
use App\Models\Corporation;
use App\Models\Dashboard;
use App\Models\Department;
use App\Models\Gain;
use App\Models\Investor;
use App\Models\Notification;
use App\Models\Parring;
use App\Models\Partner;
use App\Models\Recharge;
use App\Models\Role;
use App\Models\Subscription;
use App\Models\Ticket;
use App\Models\Transaction;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        $fx_collect = new FunctionCollection();
        $analytic_data = $fx_collect->WalletBalance();

        $parringsCount = Parring::count();
        $rechargesCount = Recharge::count();
        $usersCount = User::count();
        $transactionsCount = Transaction::count();
        $investorsCount = Investor::count();
        $notificationsCount = Notification::count();
        $gainsCount = Gain::count();
        $bonusCount = Bonus::count();
        $goals = 365;

        $date_string = "2023-09-20";
        $start_date = strtotime($date_string);
        $now = time(); // or your date as well
        $your_date = $start_date;
        $datediff = $now - $your_date;

        $date = date_create($date_string);

        $days = round($datediff / (60 * 60 * 24));

        $dashboardArrayData =  [
            "congratulations" => [
                "name" => "Utilisateur",
                "welcomeText" => $user->fullName . ", Bienvenu sur CBP Application",
                "saleToday" => ($usersCount - 1) . "+",
            ],
            "subscribersGained" => [
                "series" => [
                    [
                        "name" => "Béneficiaires",
                        "data" => [28, 40, 36, 52, 38, 60, 55],
                    ],
                ],
                "analyticsData" => [
                    "subscribers" => ($usersCount - 1),
                ],
            ],
            "ordersRecevied" => [
                "series" => [
                    [
                        "name" => "Commandes",
                        "data" => [10, 15, 8, 15, 7, 12, 8],
                    ],
                ],
                "analyticsData" => [
                    "orders" => $transactionsCount,
                ],
            ],
            "avgSessions" => [
                "sessions" => 1597000,
                "lastDays" => ["28 Derniers Jours", "Mois Passé", "Année Passée"],
                "growth" => "+5.2%",
                "start_date" => date_format($date, "d/m/Y"),
                "goal" => $goals,
                "users" => ($usersCount - 1),
                "retention" => 90,
                "duration" => 1,
                "salesBar" => [
                    "series" => [
                        [
                            "name" => "Sessions",
                            "data" => [75, 125, 225, 175, 125, 75, 25],
                        ],
                    ],
                ],
            ],
            "supportTracker" => [
                "title" => "Parrainages",
                "lastDays" => ["28 Derniers Jours", "Mois Passé", "Année Passée"],
                "totalTicket" => 111,
                "newTicket" => 29,
                "openTicket" => 63,
                "responseTime" => 99,
                "supportTrackerRadialBar" => [
                    "series" => [$days],
                ],
            ],
            "timeline" => [
                "step1" => [
                    "title" => "12 Dossiers traités",
                    "subtitle" => "Les dossiers déjà traités par l\'organisation.",
                    "img" => 'require("@/assets/images/icons/json.png")',
                    "fileName" => "data.json",
                    "duration" => "12 min passées",
                ],
                "step2" => [
                    "title" => "Rendevous avec le requerant",
                    "subtitle" => "Project réunion avec ALINDAE  @15=>00",
                    "avatar" => 'require("@/assets/images/portrait/small/avatar-s-9.jpg")',
                    "avatarName" => "Ezra (Client)",
                    "occupation" => "M&E de CBP",
                    "duration" => "15 min déjà passées",
                ],
                "step3" => [
                    "title" => "Créer un nouveau projet",
                    "subtitle" => "Ajouter les fichiers au dossier",
                    "duration" => "2 jrs passés",
                    "avatars" => [
                        [
                            "userImg" => 'require("@/assets/images/portrait/small/avatar-s-9.jpg")',
                            "name" => "Mumbere Barthelemy",
                        ],
                        [
                            "userImg" => 'require("@/assets/images/portrait/small/avatar-s-6.jpg")',
                            "name" => "Eliel Kamate",
                        ],
                        [
                            "userImg" => 'require("@/assets/images/portrait/small/avatar-s-8.jpg")',
                            "name" => "Jamel Kausi",
                        ],
                        [
                            "userImg" => 'require("@/assets/images/portrait/small/avatar-s-7.jpg")',
                            "name" => "Elikar Kanane",
                        ],
                        [
                            "userImg" => 'require("@/assets/images/portrait/small/avatar-s-20.jpg")',
                            "name" => "David Mika",
                        ],
                    ],
                ],
                "step4" => [
                    "title" => "Créer un nouveau projet",
                    "duration" => "5 jrs passés",
                    "subtitle" => "Ajouter les fichiers au dossier",
                ],
            ],
            "salesChart" => [
                "series" => [
                    [
                        "name" => "Commandes",
                        "data" => [90, 50, 86, 40, 100, 20],
                    ],
                    [
                        "name" => "Visites",
                        "data" => [70, 75, 70, 76, 20, 85],
                    ],
                ],
            ],
            "appDesign" => [
                "date" => "18 Aout, 22",
                "title" => "Design de l\'Interface",
                "subtitle" => "Ralativité pour IOS, Android et Web, multi-target Design",
                "teams" => [
                    ["name" => "Figma", "color" => "light-warning"],
                    ["name" => "Wireframe", "color" => "light-primary"],
                ],
                "members" => [
                    [
                        "img" => 'require("@/assets/images/portrait/small/avatar-s-9.jpg")',
                        "color" => "primary",
                    ],
                    ["text" => "PI", "color" => "light-danger"],
                    [
                        "img" => 'require("@/assets/images/portrait/small/avatar-s-14.jpg")',
                        "color" => "primary",
                    ],
                    [
                        "img" => 'require("@/assets/images/portrait/small/avatar-s-7.jpg")',
                        "color" => "primary",
                    ],
                    ["text" => "AL", "color" => "light-secondary"],
                ],
                "planing" => [
                    ["title" => "Date", "subtitle" => "19 Aout, 22"],
                    ["title" => "Budget", "subtitle" => "4951.91$"],
                    ["title" => "Coût", "subtitle" => "840.99$"],
                ],
            ],
        ];

        $roleAndPermissions = auth()->check() ? auth()->user()->jsPermissions() : 0;

        // get all inherited permissions for that user
        $permissionsOnly = $user->getAllPermissions();

        return response()->json([
            'data' => $dashboardArrayData,
            'roleAndPermissions' => $roleAndPermissions,
            'permissionsOnly' => $permissionsOnly,
            'message' => "Tabeau de bord par defaut",
        ]);
    }

    public function dashboard_client()
    {
        // collect function
        try {
            $functionCollection = new FunctionCollection();
            return response()->json([
                'data' => $functionCollection->WalletBalance(),
                'message' => "Tabeau de bord par defaut",
            ]);
        } catch (Exception $ex) {
            return response()->json([
                'message' => "Erreur survenu",
                'exception' => $ex,
            ],500);
        }
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
     * @param  \App\Models\Dashboard  $dashboard
     * @return \Illuminate\Http\Response
     */
    public function show($dashboard_ref)
    {
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Dashboard  $dashboard
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Dashboard $dashboard)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Dashboard  $dashboard
     * @return \Illuminate\Http\Response
     */
    public function destroy(Dashboard $dashboard)
    {
        //
    }

    public function statistics()
    {
        if (!$user = auth()->user()) {
            throw new UnauthorizedHttpException('Session Utilisateur Expirée; Veuillez vous Reconnecter à Nouveau');
        }

        try {
            $isAdmin = $user->role === 'super-admin';
            $skuUser = $user->sku_user;
            $userId = $user->id;

            // Base queries
            $ticketQuery = Ticket::query();
            $investorQuery = Investor::query();
            $subscriptionQuery = Subscription::query();
            $notificationQuery = Notification::query();
            $transactionQuery = Transaction::query();
            $rechargeQuery = Recharge::query();

            // Apply filters for non-admins
            if (!$isAdmin) {
                $ticketQuery->where('user_id', $userId);
                $investorQuery->where('sku_user', $skuUser);
                $subscriptionQuery->where('sku_user', $skuUser);
                $notificationQuery->where('sku_user', $skuUser);
                $transactionQuery->where('sku_user', $skuUser);
                $rechargeQuery->where('sku_user', $skuUser);
            }

            $stats = [
                'users' => [
                    'total' => User::count(),
                    'active' => User::where('status', 'active')->count() ?? 0,
                ],
                'departments' => Department::count(),
                'roles' => Role::count(),
                'corporations' => Corporation::count(),
                'tickets' => [
                    'total' => (clone $ticketQuery)->count(),
                    'open' => (clone $ticketQuery)->where('status', 'open')->count(),
                    'closed' => (clone $ticketQuery)->where('status', 'closed')->count(),
                ],
                'investors' => (clone $investorQuery)->count(),
                'subscriptions' => (clone $subscriptionQuery)->count(),
                'notifications' => (clone $notificationQuery)->count(),
                'transactions' => [
                    'total' => (clone $transactionQuery)->count() + (clone $rechargeQuery)->count(),
                    'recharge' => (clone $rechargeQuery)->count(),
                    'withdrawal' => (clone $transactionQuery)->where('type', 'RETRAIT')->count(),
                    'transfer' => (clone $transactionQuery)->where('type', 'TRANSFERT')->count(),
                    'crypto_buy' => (clone $transactionQuery)->where('type', 'ACHAT-CRYPTO')->count(),
                    'crypto_sell' => (clone $transactionQuery)->where('type', 'VENTE-CRYPTO')->count(),
                ]
            ];

            return response()->json([
                'data' => $stats,
                'message' => "Statistiques globales récupérées",
                'code' => 200
            ]);
        } catch (Exception $ex) {
            return response()->json([
                'message' => "Erreur lors de la récupération des statistiques",
                'error' => $ex->getMessage()
            ], 500);
        }
    }
}
