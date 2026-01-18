<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Brand>
 */
class BrandFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        $brands =  [
            'Louis Vuitton',
            'Gucci',
            'Burberry',
            'Prada',
            'Armani',
            'Versace',
            'Elikar',
            'Rolex',
            'Nike',
            'Mercedes',
            'Microsoft',
        ];

        return [
            'name'=>$this->faker->unique()->randomElement($brands),
            'details'=>$this->faker->paragraph,
        ];
    }
}
