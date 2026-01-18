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
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('sku_corporation')->nullable();
            $table->string('sku_corporation_child')->nullable();
            $table->string('sku_department')->nullable();
            $table->string('sku_department_parent')->nullable();
            $table->string('name')->nullable();
            $table->string('route')->nullable();
            $table->string('icon')->nullable()->default('ListIcon');
            $table->text('modules')->nullable();
            $table->string('description')->nullable();
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
        Schema::dropIfExists('departments');
    }
};
