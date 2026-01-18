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
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->string('sku_corporation');
            $table->string('sku_corporation_child')->nullable();
            $table->string('sku_module_parent')->nullable();
            $table->string('sku_module')->nullable();
            $table->string('version')->default('1');
            $table->string('name');
            $table->string('icon')->nullable();
            $table->text('menus')->nullable();
            $table->text('routes')->nullable();
            $table->string('route_name')->nullable();
            $table->string('breadcrumb_title')->nullable();
            $table->string('breadcrumb_parent')->nullable();
            $table->string('breadcrumb_child')->nullable();
            $table->string('breadcrumb_status')->nullable();
            $table->string('path')->nullable();
            $table->string('component')->nullable();
            $table->string('description')->nullable();
            $table->string('status')->default('1');
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
        Schema::dropIfExists('modules');
    }
};