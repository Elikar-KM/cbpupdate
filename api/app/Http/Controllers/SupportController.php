<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\SupportMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SupportController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $user = Auth::user();

        if ($user->hasRole(['super-admin', 'system-admin', 'admin'])) {
            $tickets = Ticket::with('user')->orderBy('created_at', 'desc')->get();
        } else {
            $tickets = Ticket::where('user_id', $user->id)->orderBy('created_at', 'desc')->get();
        }

        return response()->json([
            'data' => $tickets,
            'message' => 'Tickets retrieved successfully'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'priority' => 'required|in:low,medium,high',
        ]);

        $ticket = Ticket::create([
            'user_id' => Auth::id(),
            'subject' => $request->subject,
            'priority' => $request->priority,
            'status' => 'open',
        ]);

        SupportMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => Auth::id(),
            'message' => $request->message,
        ]);

        return response()->json([
            'data' => $ticket,
            'message' => 'Ticket created successfully'
        ]);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $user = Auth::user();
        $ticket = Ticket::with(['messages.user', 'user'])->findOrFail($id);

        if (!$user->hasRole(['super-admin', 'system-admin', 'admin']) && $ticket->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'data' => $ticket,
            'message' => 'Ticket retrieved successfully'
        ]);
    }

    /**
     * Reply to a ticket.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function reply(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $ticket = Ticket::findOrFail($id);
        $user = Auth::user();

        if (!$user->hasRole(['super-admin', 'system-admin', 'admin']) && $ticket->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message = SupportMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => $request->message,
        ]);

        // If admin replies, maybe update status to 'pending' or something?
        // For now, let's keep it simple.

        return response()->json([
            'data' => $message,
            'message' => 'Reply sent successfully'
        ]);
    }

    /**
     * Update the status of a ticket.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:open,pending,closed',
        ]);

        $ticket = Ticket::findOrFail($id);

        // Only admin or owner can close? Usually admins.
        // Let's allow owner to close too.
        $user = Auth::user();
        if (!$user->hasRole(['super-admin', 'system-admin', 'admin']) && $ticket->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $ticket->update(['status' => $request->status]);

        return response()->json([
            'data' => $ticket,
            'message' => 'Ticket status updated successfully'
        ]);
    }

    /**
     * Store a newly created guest ticket.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function storeGuest(Request $request)
    {
        $request->validate([
            'guest_name' => 'required|string|max:255',
            'guest_email' => 'required|email|max:255',
            'guest_phone' => 'nullable|string|max:20',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'priority' => 'required|in:low,medium,high',
        ]);

        $token = \Illuminate\Support\Str::random(32);

        $ticket = Ticket::create([
            'user_id' => null,
            'guest_name' => $request->guest_name,
            'guest_email' => $request->guest_email,
            'guest_phone' => $request->guest_phone,
            'subject' => $request->subject,
            'priority' => $request->priority,
            'status' => 'open',
            'access_token' => $token,
        ]);

        SupportMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => null,
            'message' => $request->message,
        ]);

        return response()->json([
            'data' => $ticket,
            'token' => $token,
            'message' => 'Ticket created successfully. Save your token to track your ticket.'
        ]);
    }

    /**
     * Display the specified guest ticket.
     *
     * @param  string  $token
     * @return \Illuminate\Http\JsonResponse
     */
    public function showGuest($token)
    {
        $ticket = Ticket::where('access_token', $token)->with(['messages.user'])->firstOrFail();

        return response()->json([
            'data' => $ticket,
            'message' => 'Ticket retrieved successfully'
        ]);
    }

    /**
     * Reply to a guest ticket.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $token
     * @return \Illuminate\Http\JsonResponse
     */
    public function replyGuest(Request $request, $token)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $ticket = Ticket::where('access_token', $token)->firstOrFail();

        $message = SupportMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => null,
            'message' => $request->message,
        ]);

        return response()->json([
            'data' => $message,
            'message' => 'Reply sent successfully'
        ]);
    }
}
