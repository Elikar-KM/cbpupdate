<?php

namespace Database\Seeders;

use App\Models\Store;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $fashionStore = Store::factory(1)
            ->hasAttached(
                // system admin
                User::factory()->count(2)
                    ->has(UserProfile::factory(1))
                    ->create()
                    ->each(
                        function ($user) {
                            $user->assignRole('store-admin');
                        }
                    )
            );

        // store owner
        User::factory()->count(1)
            ->has(UserProfile::factory(1))
            ->has($fashionStore)
            ->create()
            ->each(
                function ($user) {
                    $user->assignRole('store-owner');
                }
            );

        $luxuryPhoneStore = Store::factory(1)
            ->hasAttached(
                // system admin
                User::factory()->count(2)
                    ->has(UserProfile::factory(1))
                    ->create()
                    ->each(
                        function ($user) {
                            $user->assignRole('store-admin');
                        }
                    )
            );

        $budgetPhoneStore = Store::factory(1)
            ->hasAttached(
                // system admin
                User::factory()->count(2)
                    ->has(UserProfile::factory(1))
                    ->create()
                    ->each(
                        function ($user) {
                            $user->assignRole('store-admin');
                        }
                    )
            );

        // store owner
        User::factory()->count(1)
            ->has(UserProfile::factory(1))
            ->has($luxuryPhoneStore)
            ->has($budgetPhoneStore)
            ->create()
            ->each(
                function ($user) {
                    $user->assignRole('store-owner');
                }
            );

    }
}
