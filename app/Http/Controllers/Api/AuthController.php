<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Otp;
use App\Models\Users;
use Illuminate\Container\Attributes\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use  Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;
use Illuminate\Support\Str;


class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {

            $validateUser = Validator::make(
                $request->all(),
                [
                    'name' => 'required|string|max:255',
                    'email' => 'required|string|email|max:255|unique:users,email',
                    'password' => 'required|string|min:6|confirmed',
                    'phone' => 'nullable|string|unique:users,phone',
                ]
            );

            if ($validateUser->fails()) {

                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validateUser->errors()->all(),
                ], 422);
            }

            // Generate and store OTP
            $otp = rand(100000, 999999);
             Otp::create([
            'email' => $request->email,
            'name' => $request->name,
            'phone' => $request->phone,
            'password' =>bcrypt($request->password),
            'otp' => $otp,
            'expires_at' => now()->addMinutes(5),
        ]);


            Mail::to($request->email)->send(new OtpMail($otp));


             return response()->json([
            'status' => true,
            'message' => 'OTP sent to your email. Please verify to complete registration.',
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'status' => false,
            'message' => 'Failed to start registration: ' . $e->getMessage(),
        ], 500);
    }
}

    
    public function verifyOtp(Request $request)
{
    try {
        // Step 1: Validate input
        $validate = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp'   => 'required|string|size:6',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validate->errors()->all(),
            ], 422);
        }

        // Step 2: Find OTP
        $otpRecord = Otp::where('email', $request->email)
            ->where('otp', $request->otp)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (!$otpRecord) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid or expired OTP',
            ], 401);
        }



        // Step 3: Find user
        $user = Users::where('email', $otpRecord->email)->orWhere('phone', $otpRecord->phone)->first();

        if ($user) {
            return response()->json([
                'status' => false,
                'message' => 'user with theis email and phone aleady exists',
            ], 422);
        }

         $user = Users::create([
            'name' => $otpRecord->name,
            'email' => $otpRecord->email,
            'phone' => $otpRecord->phone,
            'password' => $otpRecord->password,
            'is_verified' => true,
         ]);

        // Step 5: Delete OTP
        $otpRecord->delete();

        // Step 6: Generate token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'OTP verified successfully',
            'token' => $token,
            'user' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ],
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'status' => false,
            'message' => 'Failed to verify OTP',
            'error' => $e->getMessage()
        ], 500);
    }
}

    public function login(Request $request)
    {
        try {
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
                'token_type' => 'bearer',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Login failed'
            ], 500);
        }
    }
    public function logout(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();
        return response()->json([
            'status' => true,
            'user' => $user,
            'message' => 'you have sucessfully logout'
        ], 200);
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
    public function forgotPassword(Request $request){

        $request->validate([
            'email' => 'required|email|exists:users',
        ]);
 
        $user = Users::where('email',$request->email)->first();

        $otp = rand(100000, 999999);

        Otp::create([
            'email' => $user->email,
            'otp' => $otp,
            'expires_at' => now()->addMinutes(5),
        ]);
 
        Mail::to($user->email)->send(new OtpMail($otp));

        return response()->json([
            'status' => true,
            'message' => 'Otp send to your email for  password reset',
        ]);
    }

    public function verifyForgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
        ]);



        $otpRecord = Otp::where('email', $request->email)
            ->where('otp', $request->otp)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (!$otpRecord) {

            return response()->json([
                'status' => false,
                'message' => 'Invalid or expired OTP',
            ], 401);
        }

        // Generate and store token
        $token = Str::random(60);
        try {
            $otpRecord->update(['reset_token' => $token]);

        } catch (\Exception $e) {

            return response()->json([
                'status' => false,
                'message' => 'Failed to process OTP verification',
            ], 500);
        }

        return response()->json([
            'status' => true,
            'message' => 'OTP verified successfully',
            'reset_token' => $token,
        ], 200);
    }

    
   public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'new_password' => 'required|string|min:6|confirmed',
            'reset_token' => 'string',
        ]);



        $otpRecord = Otp::where('email', $request->email)
            ->where('reset_token', $request->token)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (!$otpRecord) {

            return response()->json([
                'status' => false,
                'message' => 'Invalid or expired token. Please request a new OTP.',
            ], 401);
        }

        $user = Users::where('email', $request->email)->first();
        $user->update([
            'password' => bcrypt($request->new_password)
        ]);

        $otpRecord->delete(); // Clean up

        return response()->json([
            'status' => true,
            'message' => 'Password reset successfully.',
        ], 200);
    }
}