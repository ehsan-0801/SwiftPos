<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Supplier;

/**
 * Produces report datasets. Each method returns:
 *   ['title' => string, 'columns' => [...], 'rows' => [[...]], 'summary' => [...]]
 * so the controller can render JSON, PDF, or Excel uniformly.
 */
class ReportService
{
    private function inRange($query, ?string $from, ?string $to, string $col = 'created_at')
    {
        if ($from) $query->whereDate($col, '>=', $from);
        if ($to) $query->whereDate($col, '<=', $to);

        return $query;
    }

    public function sales(?string $from, ?string $to): array
    {
        $sales = $this->inRange(Sale::with('customer')->where('sale_status', 'completed'), $from, $to)
            ->latest()->get();

        return [
            'title' => 'Sales Report',
            'columns' => ['Invoice', 'Date', 'Customer', 'Total', 'Paid', 'Status'],
            'rows' => $sales->map(fn ($s) => [
                $s->invoice_no,
                $s->created_at->toDateString(),
                $s->customer?->name ?? 'Walk-in',
                number_format($s->total, 2),
                number_format($s->paid, 2),
                $s->payment_status,
            ])->all(),
            'summary' => [
                'Transactions' => $sales->count(),
                'Total Sales' => number_format($sales->sum('total'), 2),
            ],
        ];
    }

    public function profit(?string $from, ?string $to): array
    {
        $items = $this->inRange(
            SaleItem::with('product')->whereHas('sale', fn ($q) => $q->where('sale_status', 'completed')),
            $from, $to, 'created_at'
        )->get();

        $byDate = $items->groupBy(fn ($i) => $i->created_at->toDateString())
            ->map(function ($group) {
                $revenue = $group->sum('total');
                $cost = $group->sum(fn ($i) => $i->qty * ($i->product->cost ?? 0));

                return ['revenue' => $revenue, 'cost' => $cost, 'profit' => $revenue - $cost];
            });

        return [
            'title' => 'Profit & Loss Report',
            'columns' => ['Date', 'Revenue', 'Cost', 'Profit'],
            'rows' => $byDate->map(fn ($r, $date) => [
                $date,
                number_format($r['revenue'], 2),
                number_format($r['cost'], 2),
                number_format($r['profit'], 2),
            ])->values()->all(),
            'summary' => [
                'Total Revenue' => number_format($byDate->sum('revenue'), 2),
                'Total Cost' => number_format($byDate->sum('cost'), 2),
                'Net Profit' => number_format($byDate->sum('profit'), 2),
            ],
        ];
    }

    public function stock(): array
    {
        $products = Product::with('unit')->orderBy('name')->get();

        return [
            'title' => 'Stock Report',
            'columns' => ['Product', 'SKU', 'Stock', 'Cost', 'Stock Value'],
            'rows' => $products->map(fn ($p) => [
                $p->name, $p->sku ?? '—', $p->stock,
                number_format($p->cost, 2), number_format($p->stock * $p->cost, 2),
            ])->all(),
            'summary' => [
                'Products' => $products->count(),
                'Total Stock Value' => number_format($products->sum(fn ($p) => $p->stock * $p->cost), 2),
            ],
        ];
    }

    public function lowStock(): array
    {
        $products = Product::lowStock()->orderBy('name')->get();

        return [
            'title' => 'Low Stock Report',
            'columns' => ['Product', 'SKU', 'Stock', 'Alert At'],
            'rows' => $products->map(fn ($p) => [$p->name, $p->sku ?? '—', $p->stock, $p->alert_qty])->all(),
            'summary' => ['Items Below Threshold' => $products->count()],
        ];
    }

    public function purchases(?string $from, ?string $to): array
    {
        $purchases = $this->inRange(Purchase::with('supplier'), $from, $to)->latest()->get();

        return [
            'title' => 'Purchase Report',
            'columns' => ['Reference', 'Date', 'Supplier', 'Total', 'Paid', 'Status'],
            'rows' => $purchases->map(fn ($p) => [
                $p->reference_no, $p->created_at->toDateString(), $p->supplier?->name ?? '—',
                number_format($p->total, 2), number_format($p->paid, 2), $p->payment_status,
            ])->all(),
            'summary' => [
                'Purchases' => $purchases->count(),
                'Total' => number_format($purchases->sum('total'), 2),
            ],
        ];
    }

    public function expenses(?string $from, ?string $to): array
    {
        $expenses = $this->inRange(Expense::with('category'), $from, $to, 'date')->latest('date')->get();

        return [
            'title' => 'Expense Report',
            'columns' => ['Date', 'Category', 'Amount', 'Note'],
            'rows' => $expenses->map(fn ($e) => [
                $e->date->toDateString(), $e->category?->name ?? '—',
                number_format($e->amount, 2), $e->note ?? '',
            ])->all(),
            'summary' => ['Total Expenses' => number_format($expenses->sum('amount'), 2)],
        ];
    }

    public function customerDue(): array
    {
        $customers = Customer::where('balance', '>', 0)->orderByDesc('balance')->get();

        return [
            'title' => 'Customer Due Report',
            'columns' => ['Customer', 'Phone', 'Due'],
            'rows' => $customers->map(fn ($c) => [$c->name, $c->phone ?? '—', number_format($c->balance, 2)])->all(),
            'summary' => ['Total Receivable' => number_format($customers->sum('balance'), 2)],
        ];
    }

    public function supplierDue(): array
    {
        $suppliers = Supplier::where('balance', '>', 0)->orderByDesc('balance')->get();

        return [
            'title' => 'Supplier Due Report',
            'columns' => ['Supplier', 'Phone', 'Payable'],
            'rows' => $suppliers->map(fn ($s) => [$s->name, $s->phone ?? '—', number_format($s->balance, 2)])->all(),
            'summary' => ['Total Payable' => number_format($suppliers->sum('balance'), 2)],
        ];
    }

    public function topProducts(int $limit = 10): array
    {
        $rows = SaleItem::selectRaw('product_id, SUM(qty) as qty, SUM(total) as revenue')
            ->whereHas('sale', fn ($q) => $q->where('sale_status', 'completed'))
            ->groupBy('product_id')->orderByDesc('revenue')->limit($limit)->with('product')->get();

        return [
            'title' => 'Top Products',
            'columns' => ['Product', 'Qty Sold', 'Revenue'],
            'rows' => $rows->map(fn ($r) => [$r->product->name ?? '—', $r->qty, number_format($r->revenue, 2)])->all(),
            'summary' => ['Products Listed' => $rows->count()],
        ];
    }

    public function cashier(?string $from, ?string $to): array
    {
        $sales = $this->inRange(Sale::with('user')->where('sale_status', 'completed'), $from, $to)->get();

        $byUser = $sales->groupBy('user_id')->map(fn ($g) => [
            'cashier' => $g->first()->user?->name ?? '—',
            'count' => $g->count(),
            'total' => $g->sum('total'),
        ]);

        return [
            'title' => 'Cashier Performance',
            'columns' => ['Cashier', 'Sales', 'Total'],
            'rows' => $byUser->map(fn ($r) => [$r['cashier'], $r['count'], number_format($r['total'], 2)])->values()->all(),
            'summary' => ['Total Sales' => number_format($sales->sum('total'), 2)],
        ];
    }
}
