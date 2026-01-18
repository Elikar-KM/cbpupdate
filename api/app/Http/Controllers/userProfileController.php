<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class userProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié',
                'code' => 401
            ], 401);
        }

        // Get user avatar URL
        $avatarUrl = null;
        if ($user->avatar) {
            $baseUrl = url('/');
            $avatarUrl = str_starts_with($user->avatar, 'http')
                ? $user->avatar
                : $baseUrl . '/' . $user->avatar;
        }

        // Get statistics
        $stats = $this->getUserStatistics($user);

        return response()->json([
            'message' => 'Profil utilisateur récupéré',
            'code' => 200,
            'data' => [
                'id' => $user->id,
                'fullName' => trim(($user->firstname ?? '') . ' ' . ($user->lastname ?? '')),
                'firstname' => $user->firstname ?? '',
                'lastname' => $user->lastname ?? '',
                'username' => $user->username ?? '',
                'email' => $user->email ?? '',
                'phone' => $user->phone ?? '',
                'role' => $user->role ?? 'User',
                'created_at' => $user->created_at,
                'status' => $user->status ?? 'active',
                'sku_user' => $user->sku_user ?? '',
                'sku_corporation' => $user->sku_corporation ?? '',
                'statistics' => $stats
            ],
            'userAvatar' => $avatarUrl
        ]);
    }

    private function getUserStatistics($user)
    {
        // Count tasks/transactions
        $taskCount = DB::table('transactions')
            ->where('sku_user', $user->sku_user)
            ->count();

        // Count network connections (users in same corporation)
        $connectionsCount = DB::table('users')
            ->where('sku_corporation', $user->sku_corporation)
            ->where('id', '!=', $user->id)
            ->count();

        // Count investments
        $investmentsCount = DB::table('investments')
            ->where('sku_user', $user->sku_user)
            ->count();

        return [
            'tasks' => $taskCount,
            'connections' => $connectionsCount,
            'projects' => $investmentsCount
        ];
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié',
                'code' => 401
            ], 401);
        }

        $validated = $request->validate([
            'firstname' => 'sometimes|string|max:255',
            'lastname' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'code' => 200,
            'data' => $user
        ]);
    }
}
