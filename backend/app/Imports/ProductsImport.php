<?php

namespace App\Imports;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Unit;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

/**
 * Imports products from a spreadsheet. Expected heading row:
 * name, sku, barcode, category, brand, unit, price, cost, stock, alert_qty
 * Category/brand/unit are matched (or created) by name.
 */
class ProductsImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        if (empty($row['name'])) {
            return null;
        }

        $category = ! empty($row['category'])
            ? Category::firstOrCreate(['name' => $row['category']])
            : null;

        $brand = ! empty($row['brand'])
            ? Brand::firstOrCreate(['name' => $row['brand']])
            : null;

        $unit = ! empty($row['unit'])
            ? Unit::firstOrCreate(['name' => $row['unit']], ['short_name' => Str::limit($row['unit'], 10, '')])
            : null;

        return new Product([
            'name' => $row['name'],
            'sku' => $row['sku'] ?? null,
            'barcode' => $row['barcode'] ?? null,
            'category_id' => $category?->id,
            'brand_id' => $brand?->id,
            'unit_id' => $unit?->id,
            'price' => $row['price'] ?? 0,
            'cost' => $row['cost'] ?? 0,
            'stock' => $row['stock'] ?? 0,
            'alert_qty' => $row['alert_qty'] ?? 0,
            'is_active' => true,
        ]);
    }
}
