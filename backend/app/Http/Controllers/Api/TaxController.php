<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tax;
use Illuminate\Http\Request;

class TaxController extends Controller
{
    public function index()
    {
        return response()->json(Tax::orderBy('name')->get(['id', 'name', 'rate']));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'rate' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        return response()->json(Tax::create($data), 201);
    }

    public function update(Request $request, Tax $tax)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'rate' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);
        $tax->update($data);

        return response()->json($tax);
    }

    public function destroy(Tax $tax)
    {
        $tax->delete();

        return response()->json(['message' => 'Tax deleted.']);
    }
}
