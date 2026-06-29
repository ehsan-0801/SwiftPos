<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSaleRequest;
use App\Http\Resources\SaleResource;
use App\Models\Sale;
use App\Models\Setting;
use App\Services\SaleService;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    public function __construct(private SaleService $sales) {}

    /** List sales. Cashiers (no view-sales permission) see only their own. */
    public function index(Request $request)
    {
        $query = Sale::query()->with(['customer', 'user'])->latest();

        if (! $request->user()->can('view-sales')) {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->query('from'));
        }
        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->query('to'));
        }
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->query('payment_status'));
        }

        return SaleResource::collection($query->paginate($request->integer('per_page', 20)));
    }

    public function store(StoreSaleRequest $request)
    {
        $sale = $this->sales->create($request->validated(), $request->user()->id);

        return (new SaleResource($sale))->response()->setStatusCode(201);
    }

    public function show(Request $request, Sale $sale)
    {
        $this->authorizeView($request, $sale);

        return new SaleResource($sale->load(['items.product', 'customer', 'user']));
    }

    /** Return/refund a sale — restores stock and marks it returned. */
    public function refund(Sale $sale)
    {
        return new SaleResource($this->sales->refund($sale->load('items.product')));
    }

    /** Receipt payload: sale + business settings for thermal/A4 rendering. */
    public function receipt(Request $request, Sale $sale)
    {
        $this->authorizeView($request, $sale);

        $keys = ['business_name', 'business_address', 'business_phone',
            'currency_symbol', 'receipt_header', 'receipt_footer', 'thermal_format'];

        $settings = Setting::whereIn('key', $keys)->pluck('value', 'key');

        return response()->json([
            'sale' => new SaleResource($sale->load(['items.product', 'customer', 'user'])),
            'settings' => $settings,
        ]);
    }

    /** Cashiers may only view their own sales. */
    private function authorizeView(Request $request, Sale $sale): void
    {
        abort_if(
            ! $request->user()->can('view-sales') && $sale->user_id !== $request->user()->id,
            403,
            'You can only view your own sales.'
        );
    }
}
