<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerGroup;
use Illuminate\Http\Request;

class CustomerGroupController extends Controller
{
    public function index()
    {
        return response()->json(CustomerGroup::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        return response()->json(CustomerGroup::create($data), 201);
    }

    public function update(Request $request, CustomerGroup $customerGroup)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        $customerGroup->update($data);

        return response()->json($customerGroup);
    }

    public function destroy(CustomerGroup $customerGroup)
    {
        $customerGroup->delete();

        return response()->json(['message' => 'Group deleted.']);
    }
}
