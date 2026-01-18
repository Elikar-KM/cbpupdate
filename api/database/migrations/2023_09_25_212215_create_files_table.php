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
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->string('sku_file')->unique()->nullable();
            $table->string('sku_user')->nullable();
            $table->string('name', 256)->unique()->nullable();
            $table->string('type')->nullable();
            $table->text('description')->nullable();
            $table->string('url')->nullable();
            $table->binary('file')->nullable();
            $table->integer('size')->nullable();
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
        Schema::dropIfExists('files');
    }
};
