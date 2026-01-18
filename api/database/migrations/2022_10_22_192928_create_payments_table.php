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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('sku_corporation')->nullable();
            $table->string('sku_corporation_child')->nullable();
            $table->string('sku_payment')->unique()->nullable();
            $table->string('sku_user');
            $table->string('sku_salary')->nullable();
            $table->double('amount')->nullable();
            $table->string('wallet')->nullable();
            $table->string('year')->nullable();
            $table->string('month')->nullable();
            $table->text('payment_data')->nullable();
            $table->string('notes')->nullable();
            $table->integer('status')->default(0);
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
        Schema::dropIfExists('payments');
    }
};
