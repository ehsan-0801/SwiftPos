<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /** Authenticate by email + password and issue a Sanctum token. */
    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['This account is inactive.'],
            ]);
        }

        $token = $user->createToken('auth')->plainTextToken;

        AuditLog::record('auth.login', $user, "{$user->name} logged in", [], $user->id);

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ]);
    }

    /** Revoke the current access token. */
    public function logout(Request $request)
    {
        AuditLog::record('auth.logout', $request->user(), "{$request->user()->name} logged out");

        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    /** Return the authenticated user with roles + permissions. */
    public function me(Request $request)
    {
        return new UserResource($request->user());
    }
}
