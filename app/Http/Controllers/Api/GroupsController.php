<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Groups;
use App\Models\GroupMembers;
use App\Models\Users;
use App\Models\Stories;
use App\Models\Posts;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

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
            Log::error('Groups Index Error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve groups',
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthenticated',
                ], 401);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()->all(),
                ], 422);
            }

            $group = DB::transaction(function () use ($request, $user) {
                $group = Groups::create([
                    'name' => $request->name,
                    'description' => $request->description,
                    'created_by' => $user->id,
                    'is_shared' => $request->input('is_shared', false),
                    'share_code' => \Illuminate\Support\Str::random(8),
                ]);

                GroupMembers::create([
                    'group_id' => $group->id,
                    'user_id' => $user->id,
                    'joined_via_code' => false,
                    'is_shared_to_member' => false,
                ]);

                return $group;
            });

            Log::info('Group created', ['group_id' => $group->id, 'user_id' => $user->id]);

            return response()->json([
                'status' => true,
                'message' => 'Group created successfully',
                'data' => $group,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Create Group Error: ' . $e->getMessage(), ['user_id' => $request->user() ? $request->user()->id : null]);
            return response()->json([
                'status' => false,
                'message' => 'Failed to create group',
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

            $isMember = GroupMembers::where('group_id', $id)->where('user_id', $user->id)->exists();
            if ($group->created_by !== $user->id && !$isMember) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized: You are not a member or creator',
                ], 403);
            }

            return response()->json([
                'status' => true,
                'message' => 'Group retrieved successfully',
                'data' => $group,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Show Group Error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve group',
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string|max:500',
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
            Log::error('Update Group Error: ' . $e->getMessage());
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
            Log::error('Delete Group Error: ' . $e->getMessage());
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
            Log::error('Toggle Sharing Error: ' . $e->getMessage());
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
                    'message' => 'Group sharing disabled',
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
            Log::error('Join Group Error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to join group',
            ], 500);
        }
    }

    public function createStory(Request $request)
    {
        try {
            $user = $request->user();
            $validator = Validator::make($request->all(), [
                'group_id' => 'required|exists:groups,id',
                'content' => 'required|string|max:500',
                'shared_with' => 'nullable|array',
                'shared_with.*' => 'exists:users,id', // Validate user IDs
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()->all(),
                ], 422);
            }

            $groupId = $request->group_id;
            if (!GroupMembers::where('group_id', $groupId)->where('user_id', $user->id)->exists()) {
                return response()->json([
                    'status' => false,
                    'message' => 'You are not a member of this group',
                ], 403);
            }

            $story = DB::transaction(function () use ($request, $user, $groupId) {
                $story = Stories::create([
                    'user_id' => $user->id,
                    'group_id' => $groupId,
                    'content' => $request->content,
                    'type' => 'text',
                    'expires_at' => now()->addHours(24),
                ]);

                // Share with selected members
                if ($request->has('shared_with') && !empty($request->shared_with)) {
                    $sharedWith = $request->shared_with;
                    // Ensure shared_with users are group members
                    $validMembers = GroupMembers::where('group_id', $groupId)
                        ->whereIn('user_id', $sharedWith)
                        ->pluck('user_id')
                        ->toArray();

                    if (count($validMembers) !== count($sharedWith)) {
                        throw new \Exception('Some selected users are not group members');
                    }

                    $storyShares = array_map(function ($userId) use ($story, $groupId) {
                        return [
                            'story_id' => $story->id,
                            'user_id' => $userId,
                            'group_id' => $groupId,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }, $validMembers);

                    DB::table('story_shares')->insert($storyShares);
                } else {
                    // Share with creator by default
                    DB::table('story_shares')->insert([
                        'story_id' => $story->id,
                        'user_id' => $user->id,
                        'group_id' => $groupId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                return $story;
            });

            Log::info('Text Story created', ['story_id' => $story->id, 'user_id' => $user->id]);
            return response()->json([
                'status' => true,
                'message' => 'Text story created successfully',
                'data' => $story->load('user:id,name'),
            ], 201);
        } catch (\Exception $e) {
            Log::error('Create Text Story Error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to create text story: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getGroupStories(Request $request, $groupId)
    {
        try {
            $user = $request->user();
            $group = Groups::findOrFail($groupId);
            if (!GroupMembers::where('group_id', $groupId)->where('user_id', $user->id)->exists()) {
                return response()->json([
                    'status' => false,
                    'message' => 'You are not a member of this group',
                ], 403);
            }

            $stories = Stories::where('group_id', $groupId)
                ->where('expires_at', '>=', now())
                ->where('type', 'text')
                ->where(function ($query) use ($user, $groupId) {
                    $query->where('user_id', $user->id) // Creator sees their own stories
                          ->orWhereExists(function ($subQuery) use ($user, $groupId) {
                              $subQuery->select(DB::raw(1))
                                       ->from('story_shares')
                                       ->whereColumn('story_shares.story_id', 'stories.id')
                                       ->where('story_shares.user_id', $user->id)
                                       ->where('story_shares.group_id', $groupId);
                          });
                })
                ->with('user:id,name')
                ->get();

            return response()->json([
                'status' => true,
                'message' => 'Stories retrieved successfully',
                'data' => [
                    'stories' => $stories
                ]
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get Text Stories Error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch text stories',
            ], 500);
        }
    }

    public function createPost(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'group_id' => 'required|exists:groups,id',
                'content' => 'required|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'data' => ['errors' => $validator->errors()->all()]
                ], 422);
            }

            $user = $request->user();
            if (!GroupMembers::where('group_id', $request->group_id)->where('user_id', $user->id)->exists()) {
                return response()->json([
                    'status' => false,
                    'message' => 'You are not a member of this group',
                ], 403);
            }

            $post = Posts::create([
                'user_id' => $user->id,
                'group_id' => $request->group_id,
                'content' => $request->content,
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Post created successfully',
                'data' => [
                    'post' => $post->load('user:id,name')
                ]
            ], 201);
        } catch (\Exception $e) {
            Log::error('Create Text Post Error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to create text post',
            ], 500);
        }
    }

    public function getGroupPosts(Request $request, $groupId)
    {
        try {
            $user = $request->user();
            $group = Groups::findOrFail($groupId);
            if (!GroupMembers::where('group_id', $groupId)->where('user_id', $user->id)->exists()) {
                return response()->json([
                    'status' => false,
                    'message' => 'You are not a member of this group',
                ], 403);
            }

            $posts = Posts::where('group_id', $groupId)
                ->with('user:id,name')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'status' => true,
                'message' => 'Posts retrieved successfully',
                'data' => [
                    'posts' => $posts
                ]
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get Text Posts Error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch text posts',
            ], 500);
        }
    }
    // ... (all previous methods unchanged)

    public function getGroupMembers(Request $request, $groupId)
    {
        try {
            $user = $request->user();
            $group = Groups::findOrFail($groupId);
            if (!GroupMembers::where('group_id', $groupId)->where('user_id', $user->id)->exists()) {
                return response()->json([
                    'status' => false,
                    'message' => 'You are not a member of this group',
                ], 403);
            }

            $members = GroupMembers::where('group_id', $groupId)
                ->with('user:id,name,email')
                ->get()
                ->map(function ($member) {
                    return [
                        'user_id' => $member->user_id,
                        'user_name' => $member->user->name,
                        'user_email' => $member->user->email,
                    ];
                });

            return response()->json([
                'status' => true,
                'message' => 'Members retrieved successfully',
                'data' => $members
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get Group Members Error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch group members',
            ], 500);
        }
    }

    // ... (all other methods unchanged)
}
