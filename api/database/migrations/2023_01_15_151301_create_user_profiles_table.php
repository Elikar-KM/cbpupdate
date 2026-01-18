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
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table  ->foreignId('user_id')
                    ->constrained('users')
                    ->cascadeOnUpdate()
                    ->cascadeOnDelete();
            $table->tinyText('firstname');
            $table->tinyText('lastname');
            $table->enum('gender', ['male', 'female', 'trans person', 'other']);
            $table->boolean('active');
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
        Schema::dropIfExists('user_profiles');
    }
};
