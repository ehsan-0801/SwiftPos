<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    public function index()
    {
        return response()->json(Unit::orderBy('name')->get(['id', 'name', 'short_name']));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'short_name' => ['required', 'string', 'max:20'],
        ]);

        return response()->json(Unit::create($data), 201);
    }

    public function update(Request $request, Unit $unit)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'short_name' => ['required', 'string', 'max:20'],
        ]);
        $unit->update($data);

        return response()->json($unit);
    }

    public function destroy(Unit $unit)
    {
        $unit->delete();

        return response()->json(['message' => 'Unit deleted.']);
    }
}
