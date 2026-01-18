<?php

namespace App\Http\Controllers;

use App\Models\NotificationCampaign;
use App\Models\NotificationTemplate;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class NotificationCampaignController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Get all campaigns
     */
    public function index(): JsonResponse
    {
        $campaigns = NotificationCampaign::with(['template', 'creator:id,name,email'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $campaigns
        ]);
    }

    /**
     * Get a single campaign
     */
    public function show($id): JsonResponse
    {
        $campaign = NotificationCampaign::with(['template', 'creator', 'logs'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $campaign
        ]);
    }

    /**
     * Create a new campaign
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|in:email,web,sms,push',
            'template_id' => 'required|exists:notification_templates,id',
            'target_type' => 'required|in:all,role,status,custom,manual',
            'target_filters' => 'nullable|array',
            'scheduled_at' => 'nullable|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $campaign = NotificationCampaign::create([
            ...$request->all(),
            'status' => 'draft',
            'created_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Campagne créée avec succès',
            'data' => $campaign
        ], 201);
    }

    /**
     * Update a campaign
     */
    public function update(Request $request, $id): JsonResponse
    {
        $campaign = NotificationCampaign::findOrFail($id);

        if (!$campaign->canBeSent()) {
            return response()->json([
                'success' => false,
                'message' => 'Cette campagne ne peut pas être modifiée'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'type' => 'in:email,web,sms,push',
            'template_id' => 'exists:notification_templates,id',
            'target_type' => 'in:all,role,status,custom,manual',
            'target_filters' => 'nullable|array',
            'scheduled_at' => 'nullable|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $campaign->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Campagne mise à jour avec succès',
            'data' => $campaign
        ]);
    }

    /**
     * Delete a campaign
     */
    public function destroy($id): JsonResponse
    {
        $campaign = NotificationCampaign::findOrFail($id);

        if (!$campaign->canBeSent()) {
            return response()->json([
                'success' => false,
                'message' => 'Cette campagne ne peut pas être supprimée'
            ], 400);
        }

        $campaign->delete();

        return response()->json([
            'success' => true,
            'message' => 'Campagne supprimée avec succès'
        ]);
    }

    /**
     * Send campaign immediately
     */
    public function send($id): JsonResponse
    {
        $campaign = NotificationCampaign::with('template')->findOrFail($id);

        if (!$campaign->canBeSent()) {
            return response()->json([
                'success' => false,
                'message' => 'Cette campagne ne peut pas être envoyée'
            ], 400);
        }

        $results = $this->notificationService->sendCampaign($campaign);

        return response()->json([
            'success' => true,
            'message' => 'Campagne envoyée avec succès',
            'data' => $results
        ]);
    }

    /**
     * Schedule campaign for later
     */
    public function schedule(Request $request, $id): JsonResponse
    {
        $campaign = NotificationCampaign::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'scheduled_at' => 'required|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $campaign->update([
            'scheduled_at' => $request->scheduled_at,
            'status' => 'scheduled'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Campagne planifiée avec succès',
            'data' => $campaign
        ]);
    }

    /**
     * Cancel a scheduled campaign
     */
    public function cancel($id): JsonResponse
    {
        $campaign = NotificationCampaign::findOrFail($id);

        if ($campaign->status !== 'scheduled') {
            return response()->json([
                'success' => false,
                'message' => 'Seules les campagnes planifiées peuvent être annulées'
            ], 400);
        }

        $campaign->update([
            'status' => 'cancelled',
            'scheduled_at' => null
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Campagne annulée avec succès'
        ]);
    }

    /**
     * Get campaign statistics
     */
    public function stats($id): JsonResponse
    {
        $campaign = NotificationCampaign::findOrFail($id);
        $campaign->updateStats();

        return response()->json([
            'success' => true,
            'data' => $campaign->stats
        ]);
    }

    /**
     * Preview target users
     */
    public function previewTargets($id): JsonResponse
    {
        $campaign = NotificationCampaign::findOrFail($id);
        $users = $this->notificationService->getTargetUsers($campaign);

        return response()->json([
            'success' => true,
            'data' => [
                'count' => $users->count(),
                'users' => $users->take(10)->map(fn($u) => [
                    'id' => $u->id,
                    'name' => $u->name ?? $u->fullName,
                    'email' => $u->email,
                    'role' => $u->role
                ])
            ]
        ]);
    }
}
