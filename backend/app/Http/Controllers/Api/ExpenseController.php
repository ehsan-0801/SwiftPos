<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExpenseRequest;
use App\Http\Resources\ExpenseResource;
use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::query()->with(['category', 'user'])->latest('date');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->query('category_id'));
        }
        if ($request->filled('from')) {
            $query->whereDate('date', '>=', $request->query('from'));
        }
        if ($request->filled('to')) {
            $query->whereDate('date', '<=', $request->query('to'));
        }

        return ExpenseResource::collection($query->paginate($request->integer('per_page', 20)));
    }

    public function store(StoreExpenseRequest $request)
    {
        $expense = Expense::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return new ExpenseResource($expense->load(['category', 'user']));
    }

    public function update(StoreExpenseRequest $request, Expense $expense)
    {
        $expense->update($request->validated());

        return new ExpenseResource($expense->load(['category', 'user']));
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();

        return response()->json(['message' => 'Expense deleted.']);
    }
}
