<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Sale;
use Illuminate\Support\Facades\DB;

class SaleService
{
    /**
     * Create a completed sale: compute totals from authoritative product
     * data, persist the sale + items, and decrement stock — all atomically.
     *
     * @param  array  $data  validated payload (items, customer_id, discount, paid, payment_method, note)
     */
    public function create(array $data, int $userId): Sale
    {
        return DB::transaction(function () use ($data, $userId) {
            $productIds = collect($data['items'])->pluck('product_id');
            $products = Product::whereIn('id', $productIds)
                ->with('tax')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $subtotal = 0;
            $taxTotal = 0;
            $lines = [];

            foreach ($data['items'] as $item) {
                $product = $products[$item['product_id']];
                $price = $item['price'] ?? (float) $product->price;
                $qty = $item['qty'];
                $lineDiscount = $item['discount'] ?? 0;
                $lineSubtotal = ($price * $qty) - $lineDiscount;

                $rate = $product->tax?->rate ?? 0;
                $lineTax = $lineSubtotal * ($rate / 100);

                $subtotal += $lineSubtotal;
                $taxTotal += $lineTax;

                $lines[] = [
                    'product_id' => $product->id,
                    'qty' => $qty,
                    'price' => $price,
                    'discount' => $lineDiscount,
                    'total' => $lineSubtotal,
                ];
            }

            $orderDiscount = $data['discount'] ?? 0;
            $total = round($subtotal - $orderDiscount + $taxTotal, 2);
            $paid = $data['paid'] ?? $total;

            $paymentStatus = $paid >= $total ? 'paid' : ($paid > 0 ? 'partial' : 'due');
            $change = max(0, round($paid - $total, 2));

            $sale = Sale::create([
                'invoice_no' => $this->nextInvoiceNo(),
                'customer_id' => $data['customer_id'] ?? null,
                'user_id' => $userId,
                'subtotal' => round($subtotal, 2),
                'discount' => $orderDiscount,
                'tax' => round($taxTotal, 2),
                'total' => $total,
                'paid' => $paid,
                'change' => $change,
                'payment_status' => $paymentStatus,
                'sale_status' => 'completed',
                'note' => $data['note'] ?? null,
            ]);

            $sale->items()->createMany($lines);

            // Decrement stock for each line.
            foreach ($lines as $line) {
                $products[$line['product_id']]->decrement('stock', $line['qty']);
            }

            return $sale->load(['items.product', 'customer', 'user']);
        });
    }

    /** Reverse a sale: restore stock and mark it returned. */
    public function refund(Sale $sale): Sale
    {
        return DB::transaction(function () use ($sale) {
            if ($sale->sale_status === 'returned') {
                return $sale;
            }

            foreach ($sale->items as $item) {
                $item->product?->increment('stock', $item->qty);
            }

            $sale->update(['sale_status' => 'returned']);

            return $sale->load(['items.product', 'customer', 'user']);
        });
    }

    /** Sequential, human-readable invoice number scoped to the day. */
    protected function nextInvoiceNo(): string
    {
        $date = now()->format('Ymd');
        $countToday = Sale::whereDate('created_at', now()->toDateString())->count();

        return sprintf('INV-%s-%04d', $date, $countToday + 1);
    }
}
