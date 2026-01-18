<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Department;
use App\Models\Role;
use App\Models\Corporation;
use App\Models\Ticket;
use App\Models\Investor;
use App\Models\Subscription;
use App\Models\Notification;
use App\Models\Recharge;
use App\Models\Transaction;

try {
    echo "Checking Models...\n";

    echo "Users: " . User::count() . "\n";
    echo "Departments: " . Department::count() . "\n";
    echo "Roles: " . Role::count() . "\n";
    echo "Corporations: " . Corporation::count() . "\n";

    echo "Tickets (Total): " . Ticket::count() . "\n";
    // echo "Tickets (Open): " . Ticket::where('status', 'open')->count() . "\n";

    echo "Investors: " . Investor::count() . "\n";
    echo "Subscriptions: " . Subscription::count() . "\n";
    echo "Notifications: " . Notification::count() . "\n";
    echo "Recharges: " . Recharge::count() . "\n";
    echo "Transactions: " . Transaction::count() . "\n";

    echo "All checks passed.\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
