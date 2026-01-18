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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('sku_transaction')->unique()->nullable();
            $table->string('sku_user')->nullable();
            $table->string('sku_user_validation')->nullable();
            $table->string('sku_user_destination')->nullable();
            $table->string('type')->nullable();
            $table->string('name')->nullable();
            $table->double('amount')->nullable();
            $table->double('amount_to_receive')->nullable();
            $table->string('currency')->nullable();
            $table->string('sale_method')->nullable();
            $table->text('payment_method')->nullable();
            $table->string('payment_code')->nullable();
            $table->text('payment_hash')->nullable();
            $table->string('description')->nullable();
            $table->text('meta')->nullable();
            $table->date('date_creation')->nullable();
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
        Schema::dropIfExists('transactions');
    }
};
