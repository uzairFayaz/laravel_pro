<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Groups;
use App\Models\GroupMembers;
use App\Models\Users;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class GroupsController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthenticated',
                ], 401);
            }

            // Fetch groups where user is creator or member
            $groups = Groups::where('created_by', $user->id)
                ->orWhereHas('members', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->with('creator')
                ->get();

            return response()->json([
                'status' => true,
                'message' => 'Groups retrieved successfully',
                'data' => $groups,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Groups Index Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve groups: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            Log::info('Store Group Request', ['user' => $request->user() ? $request->user()->id : null, 'input' => $request->all()]);

            if (!$request->user()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthenticated',
                ], 401);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()->all(),
                ], 422);
            }

            $group = Groups::create([
                'name' => $request->name,
                'description' => $request->description,
                'created_by' => $request->user()->id,
                'is_shared' => $request->input('is_shared', false),
                'share_code' => \Illuminate\Support\Str::random(8), // Generate share_code
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Group created successfully',
                'data' => $group,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Store Group Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => false,
                'message' => 'Failed to create group: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show(Request $request, $id)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthenticated',
                ], 401);
            }

            $group = Groups::with('creator')->findOrFail($id);

            // Check if user is creator or member
            $isMember = GroupMembers::where('group_id', $id)->where('user_id', $user->id)->exists();
            if ($group->created_by !== $user->id && !$isMember) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized: You are not a member or creator of this group',
                ], 403);
            }

            return response()->json([
                'status' => true,
                'message' => 'Group retrieved successfully',
                'data' => $group,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Show Group Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve group: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()->all(),
                ], 422);
            }

            $group = Groups::findOrFail($id);
            if ($group->created_by !== $request->user()->id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $group->update($request->only(['name', 'description']));
            return response()->json([
                'status' => true,
                'message' => 'Group updated successfully',
                'data' => $group,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Update Group Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => false,
                'message' => 'Failed to update group',
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $group = Groups::findOrFail($id);
            if ($group->created_by !== auth()->id()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }
            $group->delete();
            return response()->json([
                'status' => true,
                'message' => 'Group deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Delete Group Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete group',
            ], 500);
        }
    }

    public function toggleSharing(Request $request, $id)
    {
        try {
            $group = Groups::findOrFail($id);
            if ($group->created_by !== $request->user()->id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $group->is_shared = !$group->is_shared;
            $group->save();
            return response()->json([
                'status' => true,
                'message' => 'Group sharing ' . ($group->is_shared ? 'enabled' : 'disabled'),
                'data' => $group,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Toggle Sharing Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => false,
                'message' => 'Failed to toggle sharing',
            ], 500);
        }
    }

    public function join(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'share_code' => 'required|string|exists:groups,share_code',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()->all(),
                ], 422);
            }

            $group = Groups::where('share_code', $request->share_code)->first();
            if (!$group->is_shared) {
                return response()->json([
                    'status' => false,
                    'message' => 'Group sharing is disabled',
                ], 403);
            }

            $existingMember = GroupMembers::where('group_id', $group->id)->where('user_id', $request->user()->id)->first();
            if ($existingMember) {
                return response()->json([
                    'status' => false,
                    'message' => 'You are already a member',
                ], 422);
            }

            $member = GroupMembers::create([
                'group_id' => $group->id,
                'user_id' => $request->user()->id,
                'joined_via_code' => true,
                'is_shared_to_member' => false,
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Joined group successfully',
                'data' => $member,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Join Group Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => false,
                'message' => 'Failed to join group',
            ], 500);
        }
    }
}