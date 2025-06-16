<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GroupsController;
use App\Http\Controllers\Api\GroupMemberController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

use Illuminate\Support\Facades\Request;

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
Route::post('/verify-otp',[AuthController::class,'verifyOtp']);
Route::post('/login', [AuthController::class, 'login'])->name('api.login');
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout'])->name('api.logout');
Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'user'])->name('api.user');
Route::post('/forget-password', [AuthController::class, 'forgotPassword']);
Route::post('/verify-forget-password',[AuthController::class,'verifyForgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Group Rou
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/groups', [GroupsController::class, 'index'])->name('api.groups ');
    Route::post('/groups', [GroupsController::class, 'store'])->name('api.groups');
    Route::get('/groups/{id}', [GroupsController::class, 'show'])->name('api.groups.show');
    Route::put('/groups/{id}', [GroupsController::class, 'update'])->name('api.groups.update');
    Route::delete('/groups/{id}', [GroupsController::class, 'destroy'])->name('api.groups.destroy');
    Route::post('/groups/{id}/toggle-sharing', [GroupsController::class, 'toggleSharing'])->name('api.groups.toggle-sharing');
    Route::post('/groups/join', [GroupsController::class, 'join']);
     Route::get('/groups/{group}/members', [GroupMemberController::class, 'index']);
    Route::post('/groups/{group}/members', [GroupMemberController::class, 'store']);
    Route::delete('/groups/{group}/members/{user}', [GroupMemberController::class, 'destroy']);
    Route::put('/groups/{group}/members/{user}/toggle-sharing', [GroupMemberController::class, 'toggleSharing']);
    Route::post('/groups/stories',[GroupsController::class, 'createStory']);
    Route::get('/groups/{groupId}/stories', [GroupsController::class,'getGroupStories']);
    Route::post('/groups/posts', [GroupsController::class, 'createPost']);
    Route::get('/groups/{groupId}/posts', [GroupsController::class, 'getGroupPosts']);
    Route::post('/groups/messages', [GroupsController::class, 'sendMessage']);
    Route::get('/groups/{groupId}/messages', [GroupsController::class, 'getGroupMessages']);
});
