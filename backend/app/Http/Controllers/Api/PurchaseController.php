<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePurchaseRequest;
use App\Http\Resources\PurchaseResource;
use App\Models\Purchase;
use App\Services\PurchaseService;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    public function __construct(private PurchaseService $purchases) {}

    public function index(Request $request)
    {
        $query = Purchase::query()->with(['supplier', 'user'])->latest();

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->query('payment_status'));
        }
        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->query('supplier_id'));
        }

        return PurchaseResource::collection($query->paginate($request->integer('per_page', 20)));
    }

    public function store(StorePurchaseRequest $request)
    {
        $purchase = $this->purchases->create($request->validated(), $request->user()->id);

        return (new PurchaseResource($purchase))->response()->setStatusCode(201);
    }

    public function show(Purchase $purchase)
    {
        return new PurchaseResource($purchase->load(['items.product', 'supplier', 'user']));
    }
}
