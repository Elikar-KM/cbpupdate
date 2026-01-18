<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    public function run()
    {
        $this->call(UsersTableSeeder::class);
    }

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        $userEmail = $this->faker->unique()->safeEmail();
        return [
            'sku_corporation' => "SKU-1",
            'sku_user' => Str::random(16),
            'sku_agent' => Str::random(8),
            'role' => $this->faker->randomElement(['coordonator', 'super-admin', 'system-admin', 'finance-admin', 'accounter-admin', 'rh-admin', 'logistic-admin', 'judicial-clinic-admin', 'prevention-protection-admin', 'project-admin', 'technical-admin', 'webmaster', 'agent']),
            'fullName' => $this->faker->name(),
            'username' => $userEmail,
            'email' => $userEmail,
            'phone' => $this->faker->unique()->phoneNumber(),
            'email_verified_at' => now(),
            'password' => 'Test@123', // password
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     *
     * @return static
     */
    public function unverified()
    {
        return $this->state(function (array $attributes) {
            return [
                'email_verified_at' => null,
            ];
        });
    }
}
