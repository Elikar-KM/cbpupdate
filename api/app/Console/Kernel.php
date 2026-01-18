<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        Commands\TestingCron::class,
        Commands\EmailCron::class,
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $date = '';
        $date2 = '';
        $skuuser = '';
        // $schedule->command('inspire')->hourly();
        // $schedule->command('testing:cron')->everyMinute();
        // ->parameters(['Texas'])

        // gain sending
        $schedule->command('testing:cron', [$date, $date2, $skuuser])
        ->everyMinute()
        ->sendOutputTo('gaintask.log');

        // email sending
        $schedule->command('email:cron')->everyMinute()->sendOutputTo('emailtask.log');

    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
