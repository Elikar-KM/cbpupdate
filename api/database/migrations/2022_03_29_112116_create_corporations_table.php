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
        Schema::create('corporations', function (Blueprint $table) {
            $table->id();
            $table->string('sku_corporation');
            $table->string('corporation_name')->nullable();
            $table->string('corporation_name_mini')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('ceo')->nullable();
            $table->string('phone')->nullable();
            $table->string('country')->nullable();
            $table->string('state')->nullable();
            $table->string('town')->nullable();
            $table->string('adresse')->nullable();
            $table->string('website')->nullable();
            $table->string('email')->nullable();
            $table->string('employee_capacity')->nullable();
            $table->string('slogan')->nullable();
            $table->text('modules')->nullable();
            $table->string('description')->nullable();
            $table->string('legal')->nullable();
            $table->string('idnat')->nullable();
            $table->string('rccm')->nullable();
            $table->string('impot')->nullable();
            $table->string('facebook')->nullable();
            $table->string('twitter')->nullable();
            $table->string('googleplus')->nullable();
            $table->string('linkedin')->nullable();

            $table->boolean('alert_sale')->nullable();
            $table->boolean('alert_expense')->nullable();
            $table->boolean('alert_payment')->nullable();

            $table->boolean('alert_non_attendance')->nullable();
            $table->boolean('alert_loss')->nullable();
            $table->boolean('alert_stock')->nullable();
            $table->boolean('alert_expiration')->nullable();

            $table->boolean('alert_sms')->nullable();
            $table->boolean('alert_email')->nullable();
            $table->boolean('alert_contact')->nullable();
            $table->boolean('alert_fake_account')->nullable();

            $table->integer('annual_holiday')->default(0);
            $table->integer('reget_holiday')->default(0);
            $table->integer('circonstance_holiday')->default(0);
            $table->integer('birth_holiday')->default(0);
            $table->integer('other_holiday')->default(0);
            $table->integer('paid_holiday_interval')->default(0);
            $table->integer('send_message_task')->default(0);


            $table->timestamps();
            //
            $table->unique('sku_corporation');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('corporations');
    }
};
