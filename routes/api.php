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
Route::post('/login', [AuthController::class, 'login'])->name('api.login');
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout'])->name('api.logout');
Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'user'])->name('api.user');
// Group Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/groups', [GroupsController::class, 'index'])->name('api.groups ');
    Route::post('/groups', [GroupsController::class, 'store'])->name('api.groups');
    Route::get('/groups/{id}', [GroupsController::class, 'show'])->name('api.groups.show');
    Route::put('/groups/{id}', [GroupsController::class, 'update'])->name('api.groups.update');
    Route::delete('/groups/{id}', [GroupsController::class, 'destroy'])->name('api.groups.destroy');
    Route::post('/groups/{id}/toggle-sharing', [GroupsController::class, 'toggleSharing'])->name('api.groups.toggle-sharing');
    Route::post('/groups/join', [GroupsController::class, 'join']);
});
