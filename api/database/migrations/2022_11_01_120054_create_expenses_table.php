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
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string("sku_corporation")->nullable();
            $table->string('sku_corporation_child')->nullable();
            $table->string('sku_user')->nullable();
            $table->string('sku_user_validation')->nullable();
            $table->string('sku_expense')->nullable();
            $table->string('type')->nullable();
            $table->string('name')->nullable();
            $table->string('amount')->nullable();
            $table->string('currency')->nullable();
            $table->string('description')->nullable();
            $table->text('meta')->nullable();
            $table->date('date_submition')->nullable();
            $table->date('date_validation')->nullable();
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
        Schema::dropIfExists('expenses');
    }
};
