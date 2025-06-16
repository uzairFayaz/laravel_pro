
<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GroupsController;
use App\Http\Controllers\Api\GroupMemberController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| All API routes for user authentication, group management, and group members.
|
*/

// Authentication Routes
Route::post('/register', [AuthController::class, 'register'])->name('api.register');
Route::post('/verify-otp', [AuthController::class, 'verifyOtp'])->name('api.verify-otp');
Route::post('/login', [AuthController::class, 'login'])->name('api.login');
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout'])->name('api.logout');
Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'user'])->name('api.user');
Route::post('/forget-password', [AuthController::class, 'forgotPassword'])->name('api.forget-password');
Route::post('/verify-forget-password', [AuthController::class, 'verifyForgotPassword'])->name('api.verify-forget-password');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('api.reset-password');

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // Group Routes
    Route::get('/groups', [GroupsController::class, 'index'])->name('api.groups.index');
    Route::post('/groups', [GroupsController::class, 'store'])->name('api.groups.store');
    Route::get('/groups/{id}', [GroupsController::class, 'show'])->name('api.groups.show');
    Route::put('/groups/{id}', [GroupsController::class, 'update'])->name('api.groups.update');
    Route::delete('/groups/{id}', [GroupsController::class, 'destroy'])->name('api.groups.destroy');
    Route::post('/groups/{id}/toggle-sharing', [GroupsController::class, 'toggleSharing'])->name('api.groups.toggle-sharing');
    Route::post('/groups/join', [GroupsController::class, 'join'])->name('api.groups.join');

    // Group Member Routes
    Route::get('/groups/{group}/members', [GroupMemberController::class, 'index'])->name('api.groups.members.index');
    Route::post('/groups/{group}/members', [GroupMemberController::class, 'store'])->name('api.groups.members.store');
    Route::delete('/groups/{group}/members/{user}', [GroupMemberController::class, 'destroy'])->name('api.groups.members.destroy');
    Route::put('/groups/{group}/members/{user}/toggle-sharing', [GroupMemberController::class, 'toggleSharing'])->name('api.groups.members.toggle-sharing');

    // Story Routes
    Route::post('/stories', [GroupsController::class, 'createStory'])->name('api.stories.store');
    Route::get('/groups/{groupId}/stories', [GroupsController::class, 'getGroupStories'])->name('api.groups.stories.index');

    // Post Routes
    Route::post('/groups/posts', [GroupsController::class, 'createPost'])->name('api.groups.posts.store');
    Route::get('/groups/{groupId}/posts', [GroupsController::class, 'getGroupPosts'])->name('api.groups.posts.index');

    // Message Routes
    Route::post('/groups/messages', [GroupsController::class, 'sendMessage'])->name('api.groups.messages.store');
    Route::get('/groups/{groupId}/messages', [GroupsController::class, 'getGroupMessages'])->name('api.groups.messages.index');
});