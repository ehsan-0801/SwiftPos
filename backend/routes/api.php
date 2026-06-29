<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\CustomerGroupController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ExpenseCategoryController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\StockAdjustmentController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\TaxController;
use App\Http\Controllers\Api\UnitController;
use App\Http\Controllers\Api\UserController;
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

        // Dashboard metrics.
        Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

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

        // --- Customers ---
        Route::get('/customers/search', [CustomerController::class, 'search']);
        Route::get('/customers', [CustomerController::class, 'index']);
        Route::get('/customers/{customer}', [CustomerController::class, 'show']);
        Route::get('/customers/{customer}/history', [CustomerController::class, 'history']);

        Route::middleware('permission:manage-customers')->group(function () {
            Route::post('/customers', [CustomerController::class, 'store']);
            Route::put('/customers/{customer}', [CustomerController::class, 'update']);
            Route::delete('/customers/{customer}', [CustomerController::class, 'destroy']);

            Route::get('/customer-groups', [CustomerGroupController::class, 'index']);
            Route::post('/customer-groups', [CustomerGroupController::class, 'store']);
            Route::put('/customer-groups/{customerGroup}', [CustomerGroupController::class, 'update']);
            Route::delete('/customer-groups/{customerGroup}', [CustomerGroupController::class, 'destroy']);
        });

        // --- Suppliers ---
        Route::get('/suppliers', [SupplierController::class, 'index']);
        Route::get('/suppliers/{supplier}', [SupplierController::class, 'show']);

        Route::middleware('permission:manage-suppliers')->group(function () {
            Route::post('/suppliers', [SupplierController::class, 'store']);
            Route::put('/suppliers/{supplier}', [SupplierController::class, 'update']);
            Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy']);
        });

        // --- Purchases ---
        Route::get('/purchases', [PurchaseController::class, 'index']);
        Route::get('/purchases/{purchase}', [PurchaseController::class, 'show']);
        Route::post('/purchases', [PurchaseController::class, 'store'])->middleware('permission:create-purchase');

        // --- Stock adjustments ---
        Route::get('/stock-adjustments', [StockAdjustmentController::class, 'index']);
        Route::post('/stock-adjustments', [StockAdjustmentController::class, 'store'])->middleware('permission:adjust-stock');

        // --- Catalog management (categories / brands / units / taxes) ---
        Route::middleware('permission:manage-products')->group(function () {
            Route::post('/categories', [CategoryController::class, 'store']);
            Route::put('/categories/{category}', [CategoryController::class, 'update']);
            Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
            Route::post('/brands', [BrandController::class, 'store']);
            Route::put('/brands/{brand}', [BrandController::class, 'update']);
            Route::delete('/brands/{brand}', [BrandController::class, 'destroy']);
            Route::post('/units', [UnitController::class, 'store']);
            Route::put('/units/{unit}', [UnitController::class, 'update']);
            Route::delete('/units/{unit}', [UnitController::class, 'destroy']);
            Route::post('/taxes', [TaxController::class, 'store']);
            Route::put('/taxes/{tax}', [TaxController::class, 'update']);
            Route::delete('/taxes/{tax}', [TaxController::class, 'destroy']);
        });
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/brands', [BrandController::class, 'index']);
        Route::get('/units', [UnitController::class, 'index']);
        Route::get('/taxes', [TaxController::class, 'index']);

        // --- Expenses ---
        Route::middleware('permission:manage-expenses')->group(function () {
            Route::get('/expense-categories', [ExpenseCategoryController::class, 'index']);
            Route::post('/expense-categories', [ExpenseCategoryController::class, 'store']);
            Route::put('/expense-categories/{expenseCategory}', [ExpenseCategoryController::class, 'update']);
            Route::delete('/expense-categories/{expenseCategory}', [ExpenseCategoryController::class, 'destroy']);

            Route::get('/expenses', [ExpenseController::class, 'index']);
            Route::post('/expenses', [ExpenseController::class, 'store']);
            Route::put('/expenses/{expense}', [ExpenseController::class, 'update']);
            Route::delete('/expenses/{expense}', [ExpenseController::class, 'destroy']);
        });

        // --- Reports (JSON, or ?export=pdf|excel) ---
        Route::get('/reports/{report}', [ReportController::class, 'show'])
            ->middleware('permission:view-reports');

        // --- Settings ---
        Route::get('/settings', [SettingController::class, 'index']);
        Route::middleware('permission:system-settings')->group(function () {
            Route::post('/settings', [SettingController::class, 'update']);
            Route::post('/settings/logo', [SettingController::class, 'logo']);
        });

        // --- User management ---
        Route::middleware('permission:manage-users')->group(function () {
            Route::get('/users/roles', [UserController::class, 'roles']);
            Route::get('/users', [UserController::class, 'index']);
            Route::post('/users', [UserController::class, 'store']);
            Route::put('/users/{user}', [UserController::class, 'update']);
            Route::delete('/users/{user}', [UserController::class, 'destroy']);
        });
    });
});
