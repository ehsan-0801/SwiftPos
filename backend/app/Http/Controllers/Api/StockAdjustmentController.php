<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Product;
use App\Models\StockAdjustment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockAdjustmentController extends Controller
{
    public function index(Request $request)
    {
        $adjustments = StockAdjustment::with(['product', 'user'])
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'data' => $adjustments->through(fn ($a) => [
                'id' => $a->id,
                'product' => $a->product?->name,
                'type' => $a->type,
                'qty' => (float) $a->qty,
                'reason' => $a->reason,
                'user' => $a->user?->name,
                'created_at' => $a->created_at?->toIso8601String(),
            ])->items(),
            'meta' => [
                'total' => $adjustments->total(),
                'from' => $adjustments->firstItem(),
                'to' => $adjustments->lastItem(),
                'last_page' => $adjustments->lastPage(),
            ],
        ]);
    }

    /** Record a manual stock movement and adjust product stock atomically. */
    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'type' => ['required', 'in:in,out'],
            'qty' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        return DB::transaction(function () use ($data, $request) {
            $product = Product::lockForUpdate()->findOrFail($data['product_id']);

            $data['type'] === 'in'
                ? $product->increment('stock', $data['qty'])
                : $product->decrement('stock', $data['qty']);

            $adjustment = StockAdjustment::create([
                ...$data,
                'user_id' => $request->user()->id,
            ]);

            AuditLog::record('stock.adjusted', $product,
                "Stock {$data['type']} {$data['qty']} — {$product->name}",
                ['type' => $data['type'], 'qty' => $data['qty'], 'reason' => $data['reason'] ?? null],
                $request->user()->id
            );

            return response()->json([
                'message' => 'Stock adjusted.',
                'stock' => (float) $product->fresh()->stock,
                'id' => $adjustment->id,
            ], 201);
        });
    }
}
