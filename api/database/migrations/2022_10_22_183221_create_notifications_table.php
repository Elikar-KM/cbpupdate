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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('sku_corporation')->nullable();
            $table->string('sku_corporation_child')->nullable();
            $table->string('sku_notification')->unique()->nullable();
            $table->string('sku_user');
            $table->string('sku_agent');
            $table->string('type');
            // infos
            $table->string('ref');
            $table->string('date');
            $table->string('destination_name')->nullable();
            $table->string('destination_description')->nullable();
            $table->string('destination_adress')->nullable();
            $table->string('destination_gender')->nullable();

            // design
            $table->text('header')->nullable();
            $table->string('object');
            $table->text('description')->nullable();
            $table->text('content');
            $table->text('footer')->nullable();

             // approval
            $table->string('approver')->nullable();

            // contacts
            $table->string('phone_destination')->nullable();
            $table->string('email_destination')->nullable();
            $table->string('adress_destination')->nullable();
            $table->string('notes')->nullable();

            $table->integer('status')->default(1);
            $table->date('date_confirmation')->nullable();
            $table->date('date_termination')->nullable();
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
        Schema::dropIfExists('notifications');
    }
};
