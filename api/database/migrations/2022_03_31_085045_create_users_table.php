<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use phpDocumentor\Reflection\Types\nullable;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string("sku_corporation")->nullable();
            $table->string('sku_corporation_child')->nullable();
            $table->string("sku_user_parent")->nullable();
            $table->string("sku_user")->unique();
            $table->string("sku_agent")->nullable();
            $table->string("company")->nullable();
            $table->string("fullName")->nullable();
            $table->string("username")->nullable();
            $table->string("email")->unique();
            $table->string("phone")->unique();
            $table->string("password")->nullable();
            $table->string("role")->nullable();
            $table->string("level")->default("pigeon");
            $table->text("special_permissions")->nullable();
            $table->string("country")->nullable();
            $table->string("contact")->nullable();
            $table->string("aboutme")->nullable();
            $table->date("email_verified_at")->nullable();
            $table->string("currentPlan")->nullable();
            $table->string("avatar")->default("/img/13-small.9267629f.png");
            $table->longText("token")->nullable();
            $table->string("remember_token")->unique()->nullable();
            $table->integer("token_timeout")->default(16000);
            $table->string("status")->default('status');
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
        Schema::dropIfExists('users');
    }
};
