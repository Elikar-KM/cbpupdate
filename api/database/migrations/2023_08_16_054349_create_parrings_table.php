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
        Schema::create('parrings', function (Blueprint $table) {
            $table->id();
            $table->string('sku_parring')->unique()->nullable();
            $table->string('sku_user')->unique()->nullable();
            $table->string('sku_user_parent')->nullable();
            $table->string('method')->nullable();
            $table->integer('child')->default(0);
            $table->string('child_left')->unique()->nullable();
            $table->string('child_right')->unique()->nullable();
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
        Schema::dropIfExists('parrings');
    }
};
