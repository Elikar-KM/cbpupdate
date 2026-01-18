<?php

namespace App\Http\Controllers;

use App\Models\NotificationTemplate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class NotificationTemplateController extends Controller
{
    /**
     * Get all templates
     */
    public function index(): JsonResponse
    {
        $templates = NotificationTemplate::with('creator:id,name,email')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $templates
        ]);
    }

    /**
     * Get a single template
     */
    public function show($id): JsonResponse
    {
        $template = NotificationTemplate::with('creator')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $template
        ]);
    }

    /**
     * Create a new template
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'subject' => 'nullable|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:email,web,sms,push',
            'variables' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $template = NotificationTemplate::create([
            ...$request->all(),
            'created_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Template créé avec succès',
            'data' => $template
        ], 201);
    }

    /**
     * Update a template
     */
    public function update(Request $request, $id): JsonResponse
    {
        $template = NotificationTemplate::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'subject' => 'nullable|string|max:255',
            'content' => 'string',
            'type' => 'in:email,web,sms,push',
            'variables' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $template->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Template mis à jour avec succès',
            'data' => $template
        ]);
    }

    /**
     * Delete a template
     */
    public function destroy($id): JsonResponse
    {
        $template = NotificationTemplate::findOrFail($id);
        $template->delete();

        return response()->json([
            'success' => true,
            'message' => 'Template supprimé avec succès'
        ]);
    }

    /**
     * Preview template with sample data
     */
    public function preview(Request $request, $id): JsonResponse
    {
        $template = NotificationTemplate::findOrFail($id);

        $sampleData = [
            'user.name' => 'Jean Dupont',
            'user.email' => 'jean.dupont@example.com',
            'user.balance' => '50,000 FCFA',
            'user.role' => 'User',
            'date' => now()->format('d/m/Y'),
            'company.name' => config('app.name', 'CBP'),
        ];

        $content = $template->process($sampleData);

        return response()->json([
            'success' => true,
            'data' => [
                'subject' => str_replace(array_map(fn($k) => '{'.$k.'}', array_keys($sampleData)), array_values($sampleData), $template->subject),
                'content' => $content,
                'variables' => $template->getAvailableVariables()
            ]
        ]);
    }
}
