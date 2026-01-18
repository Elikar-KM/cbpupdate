<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\UserProfile;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->call(DefaultAdminSeeder::class);

        // coordinator
        User::factory()->count(1)
        ->has(UserProfile::factory(1))
        ->create()
        ->each(
            function($user){
                $user->assignRole('coordinator');
            }
        );

        // super admin
        User::factory()->count(2)
        ->has(UserProfile::factory(1))
        ->create()
        ->each(
            function($user){
                $user->assignRole('super-admin');
            }
        );

        // finance admin
        User::factory()->count(3)
        ->has(UserProfile::factory(1))
        ->create()
        ->each(
            function($user){
                $user->assignRole('finance-admin');
            }
        );

        // judicial clinic admin
        User::factory()->count(4)
        ->has(UserProfile::factory(1))
        ->create()
        ->each(
            function($user){
                $user->assignRole('judicial-clinic-admin');
            }
        );

        // finance admin
        User::factory()->count(5)
        ->has(UserProfile::factory(1))
        ->create()
        ->each(
            function($user){
                $user->assignRole('rh-admin');
            }
        );

        // logistic admin
        User::factory()->count(6)
        ->has(UserProfile::factory(1))
        ->create()
        ->each(
            function($user){
                $user->assignRole('logistic-admin');
            }
        );

        // finance admin
        User::factory()->count(7)
        ->has(UserProfile::factory(1))
        ->create()
        ->each(
            function($user){
                $user->assignRole('project-manager-admin');
            }
        );

        // webmaster
        User::factory()->count(8)
        ->has(UserProfile::factory(1))
        ->create()
        ->each(
            function($user){
                $user->assignRole('webmaster');
            }
        );

        // agent
        User::factory()->count(9)
        ->has(UserProfile::factory(1))
        ->create()
        ->each(
            function($user){
                $user->assignRole('agent');
            }
        );
    }
}
