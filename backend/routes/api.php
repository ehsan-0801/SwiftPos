<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SaleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes (v1)
|--------------------------------------------------------------------------
| All SwiftPOS endpoints live under the /api/v1 prefix so the API is
| versioning-ready. Resource controllers are registered per the build
| order in the spec as each module is implemented.
*/

Route::prefix('v1')->group(function () {

    Route::get('/health', fn () => response()->json([
        'status' => 'ok',
        'app' => config('app.name'),
    ]));

    // --- Auth ---
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        // Lookup data for product forms.
        Route::get('/catalog/meta', [CatalogController::class, 'meta']);

        // --- Products ---
        Route::get('/products/search', [ProductController::class, 'search']);
        Route::get('/products/low-stock', [ProductController::class, 'lowStock']);
        Route::get('/products', [ProductController::class, 'index']);
        Route::get('/products/{product}', [ProductController::class, 'show']);

        Route::middleware('permission:manage-products')->group(function () {
            Route::post('/products', [ProductController::class, 'store']);
            Route::put('/products/{product}', [ProductController::class, 'update']);
            Route::delete('/products/{product}', [ProductController::class, 'destroy']);
            Route::post('/products/import', [ProductController::class, 'import']);
        });

        // --- Sales ---
        // Listing/show are scoped to "own only" for cashiers inside the controller.
        Route::get('/sales', [SaleController::class, 'index']);
        Route::get('/sales/{sale}/receipt', [SaleController::class, 'receipt']);
        Route::get('/sales/{sale}', [SaleController::class, 'show']);
        Route::post('/sales', [SaleController::class, 'store'])->middleware('permission:make-sales');
        Route::post('/sales/{sale}/return', [SaleController::class, 'refund'])->middleware('permission:return-sales');
    });
});
