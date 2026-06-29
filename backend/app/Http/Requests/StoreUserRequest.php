<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id;
        $creating = ! $userId;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($userId)],
            'password' => [$creating ? 'required' : 'nullable', 'string', 'min:6'],
            'role' => ['required', 'exists:roles,name'],
            'pin' => ['nullable', 'string', 'max:10'],
            'is_active' => ['boolean'],
        ];
    }
}
