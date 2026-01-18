<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\Translation\Provider\NullProvider;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('sku_subscription')->unique()->nullable();
            $table->string('sku_user')->nullable();
            $table->double('amount')->nullable();
            $table->string('package_code')->default("\$");
            $table->string('description')->nullable();
            $table->string('status')->default(0);
            $table->dateTime('paid_at')->default(null);
            $table->dateTime('end_at')->default(null);
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
        Schema::dropIfExists('subscriptions');
    }
};
