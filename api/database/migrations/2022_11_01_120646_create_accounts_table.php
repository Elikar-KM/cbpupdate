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
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->string("sku_corporation")->nullable();
            $table->string('sku_corporation_child')->nullable();
            $table->string('sku_user')->nullable();
            $table->string('sku_user_validation')->nullable();
            $table->string('sku_account')->nullable();
            $table->string('country')->nullable();
            $table->string('state')->nullable();
            $table->string('town')->nullable();
            $table->string('type')->nullable();
            $table->string('corporation')->nullable();
            $table->string('name')->nullable();
            $table->string('number')->nullable();
            $table->string('description')->nullable();
            $table->double('amount')->default(0);
            $table->string('currency')->nullable();
            $table->string('picture')->nullable();
            $table->text('mandators')->nullable();
            $table->text('meta')->nullable();
            $table->string('status')->default(1);
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
        Schema::dropIfExists('accounts');
    }
};
