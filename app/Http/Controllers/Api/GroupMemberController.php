<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Groups;
use App\Models\GroupMembers;
use App\Models\Users;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class GroupMemberController extends Controller
{
    public function index($groupId)
    {
        try {
            $members = GroupMembers::where('group_id', $groupId)
                ->with([
                    'user' => function ($query) {
                        $query->select('id', 'name', 'email');
                    }
                ])
                ->get()
                ->map(function ($member) {
                    return [
                        'user_id' => $member->user_id,
                        'user_name' => $member->user->name,
                        'user_email' => $member->user->email,
                        'is_shared' => $member->is_shared,
                    ];
                });

            return response()->json([
                'status' => true,
                'message' => 'Members retrieved successfully',
                'data' => $members,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Group Members Index Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve members',
            ], 500);
        }
    }

    public function store(Request $request, $groupId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|exists:users,email',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()->all(),
                ], 422);
            }

            $group = Groups::findOrFail($groupId);
            if ($group->created_by !== $request->user()->id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $user = Users::where('email', $request->email)->first();
            $existingMember = GroupMembers::where('group_id', $groupId)->where('user_id', $user->id)->first();
            if ($existingMember) {
                return response()->json([
                    'status' => false,
                    'message' => 'User is already a member',
                ], 422);
            }

            $member = GroupMembers::create([
                'group_id' => $groupId,
                'user_id' => $user->id,
                'is_shared' => false,
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Member added successfully',
                'data' => $member,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Store Group Member Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => false,
                'message' => 'Failed to add member: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($groupId, $userId)
    {
        try {
            $group = Groups::findOrFail($groupId);
            if ($group->created_by !== auth()->id()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $member = GroupMembers::where('group_id', $groupId)->where('user_id', $userId)->firstOrFail();
            $member->delete();
            return response()->json([
                'status' => true,
                'message' => 'Member removed successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Delete Group Member Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => false,
                'message' => 'Failed to remove member',
            ], 500);
        }
    }

    public function toggleSharing(Request $request, $groupId, $userId)
    {
        try {
            $group = Groups::findOrFail($groupId);
            if ($group->created_by !== $request->user()->id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $member = GroupMembers::where('group_id', $groupId)->where('user_id', $userId)->firstOrFail();
            $member->is_shared = !$member->is_shared;
            $member->save();
            return response()->json([
                'status' => true,
                'message' => 'Member sharing ' . ($member->is_shared ? 'enabled' : 'disabled'),
                'data' => $member,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Toggle Member Sharing Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => false,
                'message' => 'Failed to toggle sharing',
            ], 500);
        }
    }

}
