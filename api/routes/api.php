<?php

use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\departmentController;
use App\Http\Controllers\corporationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\notificationController;
use App\Http\Controllers\roleController;
use App\Http\Controllers\userController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\MlmController;
use App\Http\Controllers\InvestorController;
use App\Http\Controllers\BonusController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\GainController;
use App\Http\Controllers\ParringController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RechargeController;
use App\Http\Controllers\SubscriptionController;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

$api = app('Dingo\Api\Routing\Router');

$api->version('v1', function ($api) {

    $api->get('/', function () {
        return 'Hello CBP Api';
    });

    $api->get('clear_cache', function () {

        // \Artisan::call('cache:clear');

        \Artisan::call('route:clear');
        \Artisan::call('config:clear');
        \Artisan::call('config:cache');
        \Artisan::call('view:clear');

        echo "Vidage de cache réussi.";

    });

    $api->post('send_gain_manualy', 'App\Http\Controllers\GainAlgoController@sendGains');
    $api->post('send_gain_manualy_by_date', 'App\Http\Controllers\GainAlgoController@sendGains');

    $api->post('TestTask', 'App\Http\Controllers\TasksController@TestTask');


    $api->get('execute-cbp-task', function () {
        \Artisan::call('schedule:run');
        $response = \Artisan::output();
        echo $response;
    });

    $api->get('execute-cbp-send-emails', function () {
        \Artisan::call('schedule:run');
        echo "Tache CBP Envoie Emails Executé avec succès.";
    });

    // menus
    $api->get('get-all-menus', 'App\Http\Controllers\departmentController@getAllMenus');
    $api->get('msgtask', 'App\Http\Controllers\notificationController@sendNotifications');

    $api->get('email', 'App\Http\Controllers\EmailController@index');

    $api->resource('user', userController::class);
    $api->get('get_user_infos/{id}', 'App\Http\Controllers\userController@userInfos');
    $api->post('user-profile', 'App\Http\Controllers\userController@profile');
    $api->post('upload_user_avatar', 'App\Http\Controllers\userController@uploadUserPicture');
    $api->post('user/{id}/suspend', 'App\Http\Controllers\userController@suspend');
    $api->post('user/{id}/activate', 'App\Http\Controllers\userController@activate');
    $api->post('user/{id}/impersonate', 'App\Http\Controllers\userController@impersonate');

    // $api->resource('dashboard', DashboardController::class);
    // $api->get('dashboard/statistics', 'App\Http\Controllers\DashboardController@statistics');
    // $api->get('dashboard-client', 'App\Http\Controllers\DashboardController@dashboard_client');

    $api->resource('message', MessageController::class);

    $api->get('public/corporation/infos', 'App\Http\Controllers\corporationController@publicInfos');
    $api->resource('corporation', corporationController::class);
    $api->post('corporation/{id}/suspend', 'App\Http\Controllers\corporationController@suspend');
    $api->post('corporation/{id}/activate', 'App\Http\Controllers\corporationController@activate');

    $api->post('update_corporation_infos', 'App\Http\Controllers\corporationController@update');
    $api->post('upload_corporation_logo', 'App\Http\Controllers\corporationController@uploadCorporationLogo');

    $api->resource('department', departmentController::class);
    $api->post('department/{id}/suspend', 'App\Http\Controllers\departmentController@suspend');
    $api->post('department/{id}/activate', 'App\Http\Controllers\departmentController@activate');

    $api->resource('role', roleController::class);
    $api->post('role/{id}/suspend', 'App\Http\Controllers\roleController@suspend');
    $api->post('role/{id}/activate', 'App\Http\Controllers\roleController@activate');

    // Duplicate user resource commented out - using the one above
    // $api->resource('user', userController::class);
    // $api->post('user/{id}/suspend', 'App\Http\Controllers\userController@suspend');
    // $api->post('user/{id}/activate', 'App\Http\Controllers\userController@activate');

    // File routes moved to api.auth group

    // report collect data
    // report collect data
    // Notification routes moved to api.auth group

    $api->resource('wallet', WalletController::class);
    $api->post('wallet/{id}/suspend', 'App\Http\Controllers\WalletController@suspend');
    $api->post('wallet/{id}/activate', 'App\Http\Controllers\WalletController@activate');

    $api->get('wallettype', 'App\Http\Controllers\WalletController@WalletTypes');

    $api->resource('package', PackageController::class);
    $api->resource('mlm', MlmController::class);

    $api->resource('investor', InvestorController::class);
    $api->post('investor/{id}/suspend', 'App\Http\Controllers\InvestorController@suspend');
    $api->post('investor/{id}/activate', 'App\Http\Controllers\InvestorController@activate');
    $api->get('calculate_gains', 'App\Http\Controllers\InvestorController@calculateGains');
    $api->get('send_gains', 'App\Http\Controllers\GainAlgoController@executeSendGains');

    $api->resource('bonus', BonusController::class);
    $api->post('bonus/{id}/suspend', 'App\Http\Controllers\BonusController@suspend');
    $api->post('bonus/{id}/activate', 'App\Http\Controllers\BonusController@activate');

    $api->resource('gain', GainController::class);
    $api->post('gain/{id}/suspend', 'App\Http\Controllers\GainController@suspend');
    $api->post('gain/{id}/activate', 'App\Http\Controllers\GainController@activate');
    $api->get('gain_infos/{sku_user}', 'App\Http\Controllers\GainController@gain_infos');

    $api->resource('parring', ParringController::class);
    $api->post('parring/{id}/suspend', 'App\Http\Controllers\ParringController@suspend');
    $api->post('parring/{id}/activate', 'App\Http\Controllers\ParringController@activate');

    $api->resource('payment', PaymentController::class);
    $api->post('payment/{id}/suspend', 'App\Http\Controllers\PaymentController@suspend');
    $api->post('payment/{id}/activate', 'App\Http\Controllers\PaymentController@activate');

    $api->resource('recharge', RechargeController::class);
    $api->put('recharge/{id}/confirm', 'App\Http\Controllers\RechargeController@confirm');
    $api->put('recharge/{id}/reject', 'App\Http\Controllers\RechargeController@reject');

    $api->resource('subscription', SubscriptionController::class);
    $api->put('subscription/{id}/confirm', 'App\Http\Controllers\SubscriptionController@confirm');
    $api->put('subscription/{id}/reject', 'App\Http\Controllers\SubscriptionController@reject');

    $api->post('cash', 'App\Http\Controllers\TransactionController@storeCashRequest');
    $api->get('cash', 'App\Http\Controllers\TransactionController@indexCashRequest');
    $api->get('cash/{id}', 'App\Http\Controllers\TransactionController@showCashRequest');
    $api->put('cash/{id}/confirm', 'App\Http\Controllers\TransactionController@confirmCashRequest');
    $api->put('cash/{id}/reject', 'App\Http\Controllers\TransactionController@rejectCashRequest');

    $api->post('transfert', 'App\Http\Controllers\TransactionController@storeTransfertRequest');
    $api->get('transfert', 'App\Http\Controllers\TransactionController@indexTransfertRequest');
    $api->get('transfert/{id}', 'App\Http\Controllers\TransactionController@showTransfertRequest');

    $api->post('coin', 'App\Http\Controllers\TransactionController@storeCoinRequest');
    $api->get('coin', 'App\Http\Controllers\TransactionController@indexCoinRequest');
    $api->get('coin/{id}', 'App\Http\Controllers\TransactionController@showCoinRequest');
    $api->put('coin/{id}/confirm', 'App\Http\Controllers\TransactionController@confirm');
    $api->put('coin/{id}/reject', 'App\Http\Controllers\TransactionController@reject');

    $api->post('coinsale', 'App\Http\Controllers\TransactionController@storeCoinSaleRequest');
    $api->get('coinsale', 'App\Http\Controllers\TransactionController@indexCoinSaleRequest');
    $api->get('coinsale/{id}', 'App\Http\Controllers\TransactionController@showCoinSaleRequest');
    $api->put('coinsale/{id}/confirm', 'App\Http\Controllers\TransactionController@confirm');
    $api->put('coinsale/{id}/reject', 'App\Http\Controllers\TransactionController@reject');

    $api->get('test', 'App\Http\Controllers\TestController@test');

    $api->get('run-sql-migration', function () {
        try {
            if (!\Illuminate\Support\Facades\Schema::hasTable('tickets')) {
                \Illuminate\Support\Facades\Schema::create('tickets', function (\Illuminate\Database\Schema\Blueprint $table) {
                    $table->id();
                    $table->unsignedBigInteger('user_id')->nullable();
                    $table->string('guest_name')->nullable();
                    $table->string('guest_email')->nullable();
                    $table->string('guest_phone')->nullable();
                    $table->string('access_token')->nullable()->unique();
                    $table->string('subject');
                    $table->string('status')->default('open');
                    $table->string('priority')->default('medium');
                    $table->timestamps();
                    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                });
            } else {
                // Add guest_phone if it doesn't exist
                if (!\Illuminate\Support\Facades\Schema::hasColumn('tickets', 'guest_phone')) {
                    \Illuminate\Support\Facades\Schema::table('tickets', function (\Illuminate\Database\Schema\Blueprint $table) {
                        $table->string('guest_phone')->nullable()->after('guest_email');
                    });
                }
            }

            if (!\Illuminate\Support\Facades\Schema::hasTable('support_messages')) {
                \Illuminate\Support\Facades\Schema::create('support_messages', function (\Illuminate\Database\Schema\Blueprint $table) {
                    $table->id();
                    $table->unsignedBigInteger('ticket_id');
                    $table->unsignedBigInteger('user_id')->nullable();
                    $table->text('message');
                    $table->string('attachment')->nullable();
                    $table->timestamps();
                    $table->foreign('ticket_id')->references('id')->on('tickets')->onDelete('cascade');
                    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                });
            }

            return response()->json(['message' => 'Tables created manually']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    // Guest Support Routes
    $api->post('guest/support/tickets', 'App\Http\Controllers\SupportController@storeGuest');
    $api->get('guest/support/tickets/{token}', 'App\Http\Controllers\SupportController@showGuest');
    $api->post('guest/support/tickets/{token}/reply', 'App\Http\Controllers\SupportController@replyGuest');

    $api->group(['prefix' => 'auth'], function ($api) {

        $api->post('signup', 'App\Http\Controllers\Auth\AuthController@store');
        $api->post('login', 'App\Http\Controllers\Auth\AuthController@login');
        $api->post('password-reset', 'App\Http\Controllers\Auth\AuthController@reset');
        $api->post('password-change', 'App\Http\Controllers\Auth\AuthController@change');

        $api->group(
            ['middleware' => 'api.auth'],
            function ($api) {
                $api->post('token/refresh', 'App\Http\Controllers\Auth\AuthController@refresh');
                $api->post('logout', 'App\Http\Controllers\Auth\AuthController@logout');
            }
        );
    });

    $api->group(
        ['prefix' => 'me', 'middleware' => 'api.auth'],
        function ($api) {
            $api->get('/profile', 'App\Http\Controllers\UserProfileController@index');
            $api->post('/profile', 'App\Http\Controllers\UserProfileController@store');
            $api->put('/profile', 'App\Http\Controllers\UserProfileController@update');
            $api->delete('/profile', 'App\Http\Controllers\UserProfileController@destroy');

            // Support System Routes
            $api->get('/support/tickets', 'App\Http\Controllers\SupportController@index');
            $api->post('/support/tickets', 'App\Http\Controllers\SupportController@store');
            $api->get('/support/tickets/{id}', 'App\Http\Controllers\SupportController@show');
            $api->post('/support/tickets/{id}/reply', 'App\Http\Controllers\SupportController@reply');
            $api->put('/support/tickets/{id}/status', 'App\Http\Controllers\SupportController@updateStatus');

            // Support Tickets - DEPRECATED/DUPLICATE
            // $api->resource('support/tickets', 'App\Http\Controllers\Support\TicketController');
            // $api->post('support/tickets/{id}/reply', 'App\Http\Controllers\Support\TicketController@reply');
            // $api->post('support/tickets/{id}/close', 'App\Http\Controllers\Support\TicketController@close');
            // $api->post('support/tickets/{id}/reopen', 'App\Http\Controllers\Support\TicketController@reopen');

            // Notification Admin System
            $api->resource('notification-templates', 'App\Http\Controllers\NotificationTemplateController');
            $api->get('notification-templates/{id}/preview', 'App\Http\Controllers\NotificationTemplateController@preview');

            $api->resource('notification-campaigns', 'App\Http\Controllers\NotificationCampaignController');
            $api->post('notification-campaigns/{id}/send', 'App\Http\Controllers\NotificationCampaignController@send');
            $api->post('notification-campaigns/{id}/schedule', 'App\Http\Controllers\NotificationCampaignController@schedule');
            $api->post('notification-campaigns/{id}/cancel', 'App\Http\Controllers\NotificationCampaignController@cancel');
            $api->get('notification-campaigns/{id}/stats', 'App\Http\Controllers\NotificationCampaignController@stats');
            $api->get('notification-campaigns/{id}/preview-targets', 'App\Http\Controllers\NotificationCampaignController@previewTargets');
        }
    );

    $api->group(
        ['middleware' => 'api.auth'],
        function ($api) {
            $api->resource('notification', notificationController::class);
            $api->post('notification/{id}/suspend', 'App\Http\Controllers\notificationController@suspend');
            $api->post('notification/{id}/activate', 'App\Http\Controllers\notificationController@activate');

            $api->get('dashboard/statistics', 'App\Http\Controllers\DashboardController@statistics');
            $api->resource('dashboard', DashboardController::class);
            $api->get('dashboard-client', 'App\Http\Controllers\DashboardController@dashboard_client');
        }
    );

    $api->group(
        ['middleware' => ['role:rh-manager'], 'prefix' => 'admin'],
        function ($api) {
        }
    );

    $api->group(
        ['middleware' => ['role:super-admin|system-admin'], 'prefix' => 'admin'],
        function ($api) {
            $api->resource('users', AdminUserController::class);
            $api->post('users/{id}/suspend', 'App\Http\Controllers\Admin\AdminUserController@suspend');
            $api->post('users/{id}/activate', 'App\Http\Controllers\Admin\AdminUserController@activate');
            $api->post('users/{id}/impersonate', 'App\Http\Controllers\userController@impersonate');
            $api->get('users/{id}/roles',  'App\Http\Controllers\Admin\AdminRolesController@show');
            $api->post('users/{id}/roles',  'App\Http\Controllers\Admin\AdminRolesController@changeRole');
            $api->get('users/{id}/permissions',  'App\Http\Controllers\Admin\AdminPermissionsController@show');
        }
    );

});
