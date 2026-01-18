<?php

namespace Database\Seeders;

use App\Models\Corporation;
use Database\Factories\CorporationFactory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CorporationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Corporation::create([
            'sku_corporation' => 'SKU-001',
            'corporation_name' => 'Dynamique des Femmes Juristes',
            'corporation_name_mini' => 'CBP Goma'
        ]);

        Corporation::create([
            'sku_corporation' => 'SKU-002',
            'corporation_name' => 'Dynamique de Femmes Juristes Beni',
            'corporation_name_mini' => 'CBP Beni'
        ]);
    }
}
