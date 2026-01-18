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
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->string('sku_package')->unique()->nullable();
            $table->string('code')->unique();
            $table->string('name')->unique();
            $table->string('description')->nullable();
            $table->integer('week')->nullable();
            $table->double('gain_annual')->nullable();
            $table->double('gain_daily')->nullable();
            $table->double('amount')->nullable();
            $table->string('currency')->nullable();
            $table->integer('status')->default(1);
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
        Schema::dropIfExists('packages');
    }
};
