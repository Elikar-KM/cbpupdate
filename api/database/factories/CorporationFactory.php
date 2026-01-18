<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Corporation>
 */
class CorporationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        $userEmail = $this->faker->unique()->safeEmail();
        return [
            'sku_corporation' => "SKU-001",
            'sku_user' => Str::random(16),
            'corporation_name' => "Dynamique des Femmes Juristes",
            'corporation_name_mini' => "CBP",
            'logo_url' => "logos/l7Rt6xW58gZtl39X1OLPAkxGRAwBOzRG-1901234946-logo.png",
            'phone' => "",
            'country' => "RDC",
            'state' => 'Nord Kivu', // password
            'town' => 'Goma', // password
            'remember_token' => Str::random(32),
            'email' => $userEmail,
        ];
    }
}
