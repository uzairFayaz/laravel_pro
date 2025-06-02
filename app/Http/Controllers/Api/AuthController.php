<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Users;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;


class AuthController extends Controller
{
    public function register(Request $request){
        $validateuser = Validator::make(
            $request->all(),
            [
               'name' => 'required',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string',
            'phone' => 'nullable|string|unique:users,phone',
            ]);

        if($validateuser->fails()){
        return response()->json([
            'status'=>false,
            'message'=> 'validation error',
            'error' => $validateuser->errors()->all(),
        ],401);
        }
        $users = Users::create([
            'name' =>$request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
        ]);

            // Send OTP via email or phone
         

        $token = $users->createToken('auth_token')->plainTextToken;
        return response()->json([
            'status' => true,
            'message' => 'user created sucessfully',
            'user' => $users,
            'token' => $token,
        ],200);

    
}
    public function login(Request $request)
{
    $validateUser = Validator::make(
        $request->all(),
        [
            'email' => 'required|email',
            'password' => 'required'
        ]
    );

    if ($validateUser->fails()) {
        return response()->json([
            'status' => false,
            'message' => 'Authentication failed',
            'errors' => $validateUser->errors()->all()
        ], 401);
    }

    $user = Users::where('email', trim($request->email))->first();

    if (!$user) {
        return response()->json([
            'status' => false,
            'message' => 'No user found with email: ' . trim($request->email)
        ], 401);
    }

    if (!Hash::check(trim($request->password), $user->password)) {
        return response()->json([
            'status' => false,
            'message' => 'Password does not match'
        ], 401);
    }

    return response()->json([
        'status' => true,
        'message' => 'User logged in successfully',
        'token' => $user->createToken('API TOKEN')->plainTextToken,
        'token_type' => 'bearer'
    ], 200);
}

public function logout(Request $request){
    $user = $request->user();
    $user->currentAccessToken()->delete();
    return response()->json([
        'status' => true,
        'user' => $user,
        'message' => 'you have sucessfully logout'
    ],200);

}
 public function user(Request $request)
{
    $user = $request->user();
    if (!$user) {
        return response()->json(['message' => 'Unauthenticated'], 401);
    }
    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
    ]);
}
}