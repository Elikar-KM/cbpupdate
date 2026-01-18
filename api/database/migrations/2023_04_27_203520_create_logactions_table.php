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
        Schema::create('logactions', function (Blueprint $table) {
            $table->id();
            $table->string('sku_corporation')->nullable();
            $table->string('sku_corporation_child')->nullable();
            $table->string('sku_user');
            $table->string('sku_user_validation')->nullable();
            $table->string('department')->nullable();
            $table->string('type')->nullable();
            $table->string('command')->nullable();
            $table->longText('before')->nullable();
            $table->longText('after')->nullable();
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
        Schema::dropIfExists('logactions');
    }
};
