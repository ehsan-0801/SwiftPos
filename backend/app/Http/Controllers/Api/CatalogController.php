<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Tax;
use App\Models\Unit;

class CatalogController extends Controller
{
    /** Lookup data for product forms (categories, brands, units, taxes). */
    public function meta()
    {
        return response()->json([
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'brands' => Brand::orderBy('name')->get(['id', 'name']),
            'units' => Unit::orderBy('name')->get(['id', 'name', 'short_name']),
            'taxes' => Tax::orderBy('name')->get(['id', 'name', 'rate']),
        ]);
    }
}
