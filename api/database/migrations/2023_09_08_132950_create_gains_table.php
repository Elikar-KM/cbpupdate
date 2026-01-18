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
        Schema::create('gains', function (Blueprint $table) {
            $table->id();
            $table->string('sku_gain')->unique()->nullable();
            $table->string('sku_user')->nullable();
            $table->string('sku_user_origin')->nullable();
            $table->string('reference')->nullable();
            $table->string('designation')->nullable();
            $table->string('period')->nullable();
            $table->double('amount')->nullable();
            $table->string('currency')->nullable();
            $table->string('description')->nullable();
            $table->integer('status')->default(0)->nullable();
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
        Schema::dropIfExists('gains');
    }
};
