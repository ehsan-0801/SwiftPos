<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Purchase;
use Illuminate\Support\Facades\DB;

class PurchaseService
{
    /**
     * Create a purchase and receive its items: persist totals, increment
     * product stock, and add the unpaid balance to the supplier — atomically.
     */
    public function create(array $data, int $userId): Purchase
    {
        return DB::transaction(function () use ($data, $userId) {
            $subtotal = 0;
            $lines = [];

            foreach ($data['items'] as $item) {
                $lineTotal = $item['qty'] * $item['cost'];
                $subtotal += $lineTotal;
                $lines[] = [
                    'product_id' => $item['product_id'],
                    'qty' => $item['qty'],
                    'cost' => $item['cost'],
                    'total' => $lineTotal,
                ];
            }

            $discount = $data['discount'] ?? 0;
            $tax = $data['tax'] ?? 0;
            $total = round($subtotal - $discount + $tax, 2);
            $paid = $data['paid'] ?? 0;
            $paymentStatus = $paid >= $total ? 'paid' : ($paid > 0 ? 'partial' : 'due');

            $purchase = Purchase::create([
                'reference_no' => $this->nextReferenceNo(),
                'supplier_id' => $data['supplier_id'] ?? null,
                'user_id' => $userId,
                'subtotal' => round($subtotal, 2),
                'discount' => $discount,
                'tax' => $tax,
                'total' => $total,
                'paid' => $paid,
                'payment_status' => $paymentStatus,
            ]);

            $purchase->items()->createMany($lines);

            // Receive stock and update product cost to the latest purchase cost.
            foreach ($lines as $line) {
                $product = Product::lockForUpdate()->find($line['product_id']);
                $product->increment('stock', $line['qty']);
                $product->update(['cost' => $line['cost']]);
            }

            // Amount still owed is added to the supplier balance (payable).
            if ($purchase->supplier_id && $total > $paid) {
                $purchase->supplier()->increment('balance', $total - $paid);
            }

            return $purchase->load(['items.product', 'supplier', 'user']);
        });
    }

    protected function nextReferenceNo(): string
    {
        $date = now()->format('Ymd');
        $count = Purchase::whereDate('created_at', now()->toDateString())->count();

        return sprintf('PUR-%s-%04d', $date, $count + 1);
    }
}
