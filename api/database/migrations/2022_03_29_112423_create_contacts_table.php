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
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->string('sku_corporation');
            $table->string('sku_corporation_child')->nullable();
            $table->string('sku_user')->nullable();
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('designation')->nullable();
            $table->string('contact_no')->nullable();
            $table->string('user_type')->nullable();
            $table->timestamps();
            //
            $table->unique('sku_user');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('contacts');
    }
};
