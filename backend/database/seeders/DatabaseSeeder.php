<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\CustomerGroup;
use App\Models\Product;
use App\Models\Setting;
use App\Models\Tax;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with a Super Admin, sample catalog
     * and default business settings (spec §10 — General Rules).
     */
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        // --- Super Admin user ---
        $admin = User::firstOrCreate(
            ['email' => 'admin@swiftpos.test'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'pin' => '1234',
                'is_active' => true,
            ]
        );
        $admin->assignRole('Super Admin');

        // --- Lookups ---
        $pcs = Unit::firstOrCreate(['name' => 'Pieces'], ['short_name' => 'pcs']);
        $kg = Unit::firstOrCreate(['name' => 'Kilogram'], ['short_name' => 'kg']);
        $ltr = Unit::firstOrCreate(['name' => 'Litre'], ['short_name' => 'ltr']);

        $vat5 = Tax::firstOrCreate(['name' => 'VAT 5%'], ['rate' => 5]);
        Tax::firstOrCreate(['name' => 'VAT 15%'], ['rate' => 15]);

        $beverages = Category::firstOrCreate(['name' => 'Beverages']);
        $grocery = Category::firstOrCreate(['name' => 'Grocery']);
        $pharmacy = Category::firstOrCreate(['name' => 'Pharmacy']);

        $generic = Brand::firstOrCreate(['name' => 'Generic']);
        $coke = Brand::firstOrCreate(['name' => 'Coca-Cola']);

        $walkIn = CustomerGroup::firstOrCreate(['name' => 'Walk-in'], ['discount_percent' => 0]);
        $wholesale = CustomerGroup::firstOrCreate(['name' => 'Wholesale'], ['discount_percent' => 5]);

        // --- Sample customers & suppliers ---
        \App\Models\Customer::firstOrCreate(['phone' => '01711000001'], [
            'name' => 'Rahim Uddin', 'email' => 'rahim@example.com', 'group_id' => $walkIn->id, 'balance' => 0,
        ]);
        \App\Models\Customer::firstOrCreate(['phone' => '01711000002'], [
            'name' => 'Karim Traders', 'email' => 'karim@example.com', 'group_id' => $wholesale->id, 'balance' => 250,
        ]);

        \App\Models\Supplier::firstOrCreate(['phone' => '01811000001'], [
            'name' => 'Dhaka Distributors', 'email' => 'sales@dhakadist.com', 'balance' => 0,
        ]);
        \App\Models\Supplier::firstOrCreate(['phone' => '01811000002'], [
            'name' => 'Beverage Wholesale Ltd', 'email' => 'order@bevwholesale.com', 'balance' => 1200,
        ]);

        foreach (['Rent', 'Utilities', 'Salaries', 'Transport', 'Miscellaneous'] as $ec) {
            \App\Models\ExpenseCategory::firstOrCreate(['name' => $ec]);
        }

        // --- Sample products ---
        $products = [
            ['name' => 'Mineral Water 500ml', 'sku' => 'PRD-001', 'barcode' => '8900000000017', 'category_id' => $beverages->id, 'brand_id' => $generic->id, 'unit_id' => $pcs->id, 'price' => 20, 'cost' => 12, 'tax_id' => $vat5->id, 'stock' => 200, 'alert_qty' => 20],
            ['name' => 'Coca-Cola 250ml', 'sku' => 'PRD-002', 'barcode' => '8900000000024', 'category_id' => $beverages->id, 'brand_id' => $coke->id, 'unit_id' => $pcs->id, 'price' => 30, 'cost' => 20, 'tax_id' => $vat5->id, 'stock' => 3, 'alert_qty' => 10],
            ['name' => 'Bread Loaf', 'sku' => 'PRD-003', 'barcode' => '8900000000031', 'category_id' => $grocery->id, 'brand_id' => $generic->id, 'unit_id' => $pcs->id, 'price' => 45, 'cost' => 30, 'tax_id' => null, 'stock' => 50, 'alert_qty' => 10],
            ['name' => 'Rice (per kg)', 'sku' => 'PRD-004', 'barcode' => '8900000000048', 'category_id' => $grocery->id, 'brand_id' => $generic->id, 'unit_id' => $kg->id, 'price' => 75, 'cost' => 60, 'tax_id' => null, 'stock' => 500, 'alert_qty' => 50],
            ['name' => 'Paracetamol 500mg', 'sku' => 'PRD-005', 'barcode' => '8900000000055', 'category_id' => $pharmacy->id, 'brand_id' => $generic->id, 'unit_id' => $pcs->id, 'price' => 2, 'cost' => 1, 'tax_id' => null, 'stock' => 1000, 'alert_qty' => 100, 'expiry_date' => '2027-12-31'],
        ];

        foreach ($products as $data) {
            Product::firstOrCreate(['sku' => $data['sku']], $data);
        }

        // --- Default business settings ---
        $settings = [
            'business_name' => 'SwiftPOS Store',
            'business_address' => 'Dhaka, Bangladesh',
            'business_phone' => '+8801000000000',
            'currency_symbol' => '৳',
            'low_stock_threshold' => '10',
            'tax_inclusive' => '0',
            'receipt_header' => 'SwiftPOS Store',
            'receipt_footer' => 'Thank you for shopping with us!',
            'thermal_format' => '80mm',
            'loyalty_point_ratio' => '0',
            'session_timeout' => '30',
        ];

        foreach ($settings as $key => $value) {
            Setting::firstOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
