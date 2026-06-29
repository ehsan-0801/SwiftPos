<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;

class ExpenseCategoryController extends Controller
{
    public function index()
    {
        return response()->json(ExpenseCategory::orderBy('name')->get(['id', 'name']));
    }

    public function store(Request $request)
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:255']]);

        return response()->json(ExpenseCategory::create($data), 201);
    }

    public function update(Request $request, ExpenseCategory $expenseCategory)
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:255']]);
        $expenseCategory->update($data);

        return response()->json($expenseCategory);
    }

    public function destroy(ExpenseCategory $expenseCategory)
    {
        $expenseCategory->delete();

        return response()->json(['message' => 'Category deleted.']);
    }
}
