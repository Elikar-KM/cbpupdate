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
        Schema::table('corporations', function (Blueprint $table) {
            $table->string('login_cover_image')->nullable()->after('logo_url');
            $table->string('login_title')->nullable()->after('login_cover_image');
            $table->text('login_subtitle')->nullable()->after('login_title');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('corporations', function (Blueprint $table) {
            $table->dropColumn(['login_cover_image', 'login_title', 'login_subtitle']);
        });
    }
};
