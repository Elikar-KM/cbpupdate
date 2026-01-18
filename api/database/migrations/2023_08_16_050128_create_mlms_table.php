<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('mlms', function (Blueprint $table) {
            $table->id();
            $table->string('sku_mlm')->unique()->nullable();
            $table->string('sku_user')->nullable();
            $table->string('code')->nullable();
            $table->string('name')->nullable();
            $table->string('description')->nullable();
            $table->string('gain_percent')->nullable();
            $table->integer('sum_parring')->nullable();
            $table->double('parring_transaction_bonus')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('mlms');
    }
};
