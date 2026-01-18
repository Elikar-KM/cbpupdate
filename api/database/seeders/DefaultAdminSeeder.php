<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Support\Str;

class DefaultAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Check if admin already exists to prevent duplicates
        if (!User::where('email', 'admin@cbp.com')->exists()) {

            $admin = User::create([
                'sku_corporation' => "SKU-001",
                'sku_user' => "SKU-SUPER-ADMIN",
                'sku_agent' => "SKU-AGENT-ADMIN",
                'role' => 'super-admin',
                'fullName' => 'Super Admin',
                'username' => 'admin@cbp.com',
                'email' => 'admin@cbp.com',
                'phone' => '0123456789',
                'email_verified_at' => now(),
                'password' => 'Test@123', // Matches UserFactory default
                'remember_token' => Str::random(10),
            ]);

            // Create profile
            UserProfile::factory()->create([
                'user_id' => $admin->id,
            ]);

            // Assign role if Spatie Permission is used
            if (method_exists($admin, 'assignRole')) {
                 $admin->assignRole('super-admin');
            }

            $this->command->info('Default Admin created: admin@cbp.com / Test@123');
        } else {
            $this->command->info('Default Admin already exists.');
        }
    }
}
