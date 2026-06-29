<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->with('roles')->latest();

        if ($search = $request->query('q')) {
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
        }

        return UserResource::collection($query->paginate($request->integer('per_page', 20)));
    }

    /** Available role names for the user form. */
    public function roles()
    {
        return response()->json(Role::orderBy('name')->pluck('name'));
    }

    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'pin' => $data['pin'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);
        $user->syncRoles([$data['role']]);

        return new UserResource($user->load('roles'));
    }

    public function update(StoreUserRequest $request, User $user)
    {
        $data = $request->validated();
        $user->fill([
            'name' => $data['name'],
            'email' => $data['email'],
            'is_active' => $data['is_active'] ?? $user->is_active,
        ]);
        if (! empty($data['password'])) {
            $user->password = $data['password'];
        }
        if (array_key_exists('pin', $data)) {
            $user->pin = $data['pin'];
        }
        $user->save();
        $user->syncRoles([$data['role']]);

        return new UserResource($user->load('roles'));
    }

    public function destroy(Request $request, User $user)
    {
        abort_if($user->id === $request->user()->id, 422, 'You cannot delete your own account.');

        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }
}
