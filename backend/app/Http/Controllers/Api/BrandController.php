<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    public function index()
    {
        return response()->json(Brand::orderBy('name')->get(['id', 'name']));
    }

    public function store(Request $request)
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:255']]);

        return response()->json(Brand::create($data), 201);
    }

    public function update(Request $request, Brand $brand)
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:255']]);
        $brand->update($data);

        return response()->json($brand);
    }

    public function destroy(Brand $brand)
    {
        $brand->delete();

        return response()->json(['message' => 'Brand deleted.']);
    }
}
