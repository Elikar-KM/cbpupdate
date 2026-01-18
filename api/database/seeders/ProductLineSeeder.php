<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\ProductLine;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductLineSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        for ($i=0; $i < 5; $i++) { 
            ProductLine::factory(4)
            ->hasAttached(Brand::all()->random())
            ->create();
        }
    }
}
