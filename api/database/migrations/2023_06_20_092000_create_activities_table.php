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
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->string('sku_corporation')->nullable();
            $table->string('sku_corporation_child')->nullable();
            $table->string('sku_user')->nullable();
            $table->string('sku_assujetti')->nullable();
            $table->string('sku_activity_category')->nullable();
            $table->string('name')->nullable();
            $table->string('description')->nullable();
            $table->string('state')->nullable();
            $table->string('territory')->nullable();
            $table->string('town')->nullable();
            $table->string('township')->nullable();
            $table->string('district')->nullable();
            $table->string('road')->nullable();
            $table->string('number')->nullable();
            $table->string('status')->nullable();
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
        Schema::dropIfExists('activities');
    }
};
