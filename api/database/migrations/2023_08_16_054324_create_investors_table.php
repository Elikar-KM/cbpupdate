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
        Schema::create('investors', function (Blueprint $table) {
            $table->id();
            $table->string('sku_investor')->unique()->nullable();
            $table->string('sku_user')->unique()->nullable();
            $table->string('sku_user_parent')->nullable();
            $table->string('type')->default("Pigeon");
            $table->string('package')->nullable();
            $table->integer('childs')->nullable();
            $table->date('date_start')->nullable();
            $table->date('date_end')->nullable();
            $table->double('amount_paid')->nullable();
            $table->integer('stop_gain')->nullable();
            $table->integer('status')->nullable();
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
        Schema::dropIfExists('investors');
    }
};
