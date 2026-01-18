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
        Schema::create('recharges', function (Blueprint $table) {
            $table->id();
            $table->string('sku_recharge')->unique()->nullable();
            $table->string('sku_user')->nullable();
            $table->string('package_code')->nullable();
            $table->double('amount')->nullable();
            $table->string('currency')->default("\$");
            $table->string('payment_method')->nullable();
            $table->string('payment_code')->unique()->nullable();
            $table->string('description')->nullable();
            $table->integer('status')->default(0);
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
        Schema::dropIfExists('recharges');
    }
};
