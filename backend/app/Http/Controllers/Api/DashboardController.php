<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    /** Aggregated metrics for the dashboard (spec §3.9). */
    public function summary()
    {
        $today = Carbon::today();

        $completed = fn ($q) => $q->where('sale_status', 'completed');

        $salesToday = Sale::where($completed)->whereDate('created_at', $today)->sum('total');
        $salesWeek = Sale::where($completed)->where('created_at', '>=', Carbon::now()->startOfWeek())->sum('total');
        $salesMonth = Sale::where($completed)->where('created_at', '>=', Carbon::now()->startOfMonth())->sum('total');

        // Profit today = revenue - cost of goods sold.
        $itemsToday = SaleItem::with('product')
            ->whereHas('sale', fn ($q) => $q->where('sale_status', 'completed')->whereDate('created_at', $today))
            ->get();
        $profitToday = $itemsToday->sum(fn ($i) => $i->total - ($i->qty * ($i->product->cost ?? 0)));

        $expensesToday = Expense::whereDate('date', $today)->sum('amount');
        $lowStockCount = Product::lowStock()->count();

        // 30-day sales trend, zero-filled.
        $rows = Sale::where($completed)
            ->where('created_at', '>=', Carbon::now()->subDays(29)->startOfDay())
            ->selectRaw('DATE(created_at) as d, SUM(total) as t')
            ->groupBy('d')->pluck('t', 'd');

        $trend = collect(range(29, 0))->map(function ($daysAgo) use ($rows) {
            $date = Carbon::today()->subDays($daysAgo)->toDateString();
            return ['date' => $date, 'total' => (float) ($rows[$date] ?? 0)];
        });

        $topProducts = SaleItem::selectRaw('product_id, SUM(qty) as qty, SUM(total) as revenue')
            ->whereHas('sale', fn ($q) => $q->where('sale_status', 'completed'))
            ->groupBy('product_id')->orderByDesc('revenue')->limit(5)->with('product')
            ->get()
            ->map(fn ($r) => [
                'name' => $r->product->name ?? '—',
                'qty' => (float) $r->qty,
                'revenue' => (float) $r->revenue,
            ]);

        $recent = Sale::with('customer')->latest()->limit(10)->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'invoice_no' => $s->invoice_no,
                'customer' => $s->customer?->name ?? 'Walk-in',
                'total' => (float) $s->total,
                'payment_status' => $s->payment_status,
                'created_at' => $s->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'sales_today' => (float) $salesToday,
            'sales_week' => (float) $salesWeek,
            'sales_month' => (float) $salesMonth,
            'profit_today' => (float) $profitToday,
            'expenses_today' => (float) $expensesToday,
            'low_stock_count' => $lowStockCount,
            'sales_trend' => $trend,
            'top_products' => $topProducts,
            'recent_sales' => $recent,
        ]);
    }
}
