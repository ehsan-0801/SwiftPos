<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Resources\ProductResource;
use App\Imports\ProductsImport;
use App\Models\Product;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ProductController extends Controller
{
    /** Paginated, searchable, filterable product list. */
    public function index(Request $request)
    {
        $query = Product::query()->with(['category', 'brand', 'unit', 'tax']);

        if ($search = $request->query('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->query('category_id'));
        }

        if ($request->boolean('low_stock')) {
            $query->lowStock();
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $products = $query->latest()->paginate($request->integer('per_page', 20));

        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request)
    {
        $product = Product::create($request->validated());

        return new ProductResource($product->load(['category', 'brand', 'unit']));
    }

    public function show(Product $product)
    {
        return new ProductResource($product->load(['category', 'brand', 'unit']));
    }

    public function update(StoreProductRequest $request, Product $product)
    {
        $product->update($request->validated());

        return new ProductResource($product->load(['category', 'brand', 'unit']));
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json(['message' => 'Product deleted.']);
    }

    /** Lightweight search for the POS screen (active products only). */
    public function search(Request $request)
    {
        $search = $request->query('q', '');

        $products = Product::query()
            ->with('tax')
            ->where('is_active', true)
            ->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%");
            })
            ->limit(20)
            ->get();

        return ProductResource::collection($products);
    }

    /** Products at or below their low-stock threshold. */
    public function lowStock()
    {
        $products = Product::lowStock()->with(['category', 'unit'])->get();

        return ProductResource::collection($products);
    }

    /** Bulk import products from an Excel/CSV file. */
    public function import(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv'],
        ]);

        Excel::import(new ProductsImport, $request->file('file'));

        return response()->json(['message' => 'Products imported.']);
    }
}
