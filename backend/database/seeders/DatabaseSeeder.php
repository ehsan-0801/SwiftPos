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
        $vat15 = Tax::firstOrCreate(['name' => 'VAT 15%'], ['rate' => 15]);

        $beverages = Category::firstOrCreate(['name' => 'Beverages']);
        $grocery = Category::firstOrCreate(['name' => 'Grocery']);
        $pharmacy = Category::firstOrCreate(['name' => 'Pharmacy']);
        $snacks = Category::firstOrCreate(['name' => 'Snacks']);
        $dairy = Category::firstOrCreate(['name' => 'Dairy']);
        $personal = Category::firstOrCreate(['name' => 'Personal Care']);
        $household = Category::firstOrCreate(['name' => 'Household']);
        $stationery = Category::firstOrCreate(['name' => 'Stationery']);

        $generic = Brand::firstOrCreate(['name' => 'Generic']);
        $coke = Brand::firstOrCreate(['name' => 'Coca-Cola']);
        $pepsi = Brand::firstOrCreate(['name' => 'Pepsi']);
        $nestle = Brand::firstOrCreate(['name' => 'Nestlé']);
        $unilever = Brand::firstOrCreate(['name' => 'Unilever']);
        $pran = Brand::firstOrCreate(['name' => 'Pran']);
        $square = Brand::firstOrCreate(['name' => 'Square']);
        $aci = Brand::firstOrCreate(['name' => 'ACI']);

        $walkIn = CustomerGroup::firstOrCreate(['name' => 'Walk-in'], ['discount_percent' => 0]);
        $wholesale = CustomerGroup::firstOrCreate(['name' => 'Wholesale'], ['discount_percent' => 5]);

        // --- Sample customers (10) ---
        $customers = [
            ['phone' => '01711000001', 'name' => 'Rahim Uddin', 'email' => 'rahim@example.com', 'group_id' => $walkIn->id, 'balance' => 0, 'address' => 'Mirpur, Dhaka'],
            ['phone' => '01711000002', 'name' => 'Karim Traders', 'email' => 'karim@example.com', 'group_id' => $wholesale->id, 'balance' => 250, 'address' => 'Gulshan, Dhaka'],
            ['phone' => '01711000003', 'name' => 'Ayesha Akter', 'email' => 'ayesha@example.com', 'group_id' => $walkIn->id, 'balance' => 0, 'address' => 'Dhanmondi, Dhaka'],
            ['phone' => '01711000004', 'name' => 'Sonali Store', 'email' => 'sonali@example.com', 'group_id' => $wholesale->id, 'balance' => 1500, 'address' => 'Uttara, Dhaka'],
            ['phone' => '01711000005', 'name' => 'Jamal Hossain', 'email' => 'jamal@example.com', 'group_id' => $walkIn->id, 'balance' => 80, 'address' => 'Mohakhali, Dhaka'],
            ['phone' => '01711000006', 'name' => 'Nadia Islam', 'email' => 'nadia@example.com', 'group_id' => $walkIn->id, 'balance' => 0, 'address' => 'Banani, Dhaka'],
            ['phone' => '01711000007', 'name' => 'Green Mart', 'email' => 'greenmart@example.com', 'group_id' => $wholesale->id, 'balance' => 3200, 'address' => 'Bashundhara, Dhaka'],
            ['phone' => '01711000008', 'name' => 'Tofazzal Hossain', 'email' => 'tofa@example.com', 'group_id' => $walkIn->id, 'balance' => 0, 'address' => 'Badda, Dhaka'],
            ['phone' => '01711000009', 'name' => 'Rupali Enterprise', 'email' => 'rupali@example.com', 'group_id' => $wholesale->id, 'balance' => 540, 'address' => 'Motijheel, Dhaka'],
            ['phone' => '01711000010', 'name' => 'Sadia Rahman', 'email' => 'sadia@example.com', 'group_id' => $walkIn->id, 'balance' => 0, 'address' => 'Tejgaon, Dhaka'],
        ];
        foreach ($customers as $c) {
            \App\Models\Customer::firstOrCreate(['phone' => $c['phone']], $c);
        }

        // --- Sample suppliers (10) ---
        $suppliers = [
            ['phone' => '01811000001', 'name' => 'Dhaka Distributors', 'email' => 'sales@dhakadist.com', 'balance' => 0, 'address' => 'Tejgaon I/A, Dhaka'],
            ['phone' => '01811000002', 'name' => 'Beverage Wholesale Ltd', 'email' => 'order@bevwholesale.com', 'balance' => 1200, 'address' => 'Tongi, Gazipur'],
            ['phone' => '01811000003', 'name' => 'Pran-RFL Distribution', 'email' => 'dist@pranrfl.com', 'balance' => 0, 'address' => 'Narayanganj'],
            ['phone' => '01811000004', 'name' => 'Square Consumer Products', 'email' => 'b2b@squarecp.com', 'balance' => 4800, 'address' => 'Pabna'],
            ['phone' => '01811000005', 'name' => 'Nestlé Bangladesh', 'email' => 'trade@nestlebd.com', 'balance' => 0, 'address' => 'Gulshan, Dhaka'],
            ['phone' => '01811000006', 'name' => 'Unilever Bangladesh', 'email' => 'supply@unilever.com', 'balance' => 2600, 'address' => 'Kalurghat, Chattogram'],
            ['phone' => '01811000007', 'name' => 'ACI Limited', 'email' => 'orders@aci-bd.com', 'balance' => 0, 'address' => 'Tejgaon, Dhaka'],
            ['phone' => '01811000008', 'name' => 'Meghna Group', 'email' => 'sales@meghnagroup.com', 'balance' => 7300, 'address' => 'Sonargaon, Narayanganj'],
            ['phone' => '01811000009', 'name' => 'City Group Traders', 'email' => 'b2b@citygroup.com', 'balance' => 0, 'address' => 'Rupganj, Narayanganj'],
            ['phone' => '01811000010', 'name' => 'Akij Food & Beverage', 'email' => 'order@akij.net', 'balance' => 950, 'address' => 'Dhamrai, Dhaka'],
        ];
        foreach ($suppliers as $s) {
            \App\Models\Supplier::firstOrCreate(['phone' => $s['phone']], $s);
        }

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
            ['name' => 'Pepsi 1L', 'sku' => 'PRD-006', 'barcode' => '8900000000062', 'category_id' => $beverages->id, 'brand_id' => $pepsi->id, 'unit_id' => $pcs->id, 'price' => 90, 'cost' => 68, 'tax_id' => $vat5->id, 'stock' => 120, 'alert_qty' => 20],
            ['name' => 'Pran Mango Juice 250ml', 'sku' => 'PRD-007', 'barcode' => '8900000000079', 'category_id' => $beverages->id, 'brand_id' => $pran->id, 'unit_id' => $pcs->id, 'price' => 25, 'cost' => 16, 'tax_id' => $vat5->id, 'stock' => 8, 'alert_qty' => 15],
            ['name' => 'Nescafé Classic 50g', 'sku' => 'PRD-008', 'barcode' => '8900000000086', 'category_id' => $beverages->id, 'brand_id' => $nestle->id, 'unit_id' => $pcs->id, 'price' => 260, 'cost' => 210, 'tax_id' => $vat15->id, 'stock' => 40, 'alert_qty' => 10],
            ['name' => 'Potato Chips 100g', 'sku' => 'PRD-009', 'barcode' => '8900000000093', 'category_id' => $snacks->id, 'brand_id' => $generic->id, 'unit_id' => $pcs->id, 'price' => 50, 'cost' => 33, 'tax_id' => $vat5->id, 'stock' => 75, 'alert_qty' => 20],
            ['name' => 'Biscuits Family Pack', 'sku' => 'PRD-010', 'barcode' => '8900000000109', 'category_id' => $snacks->id, 'brand_id' => $pran->id, 'unit_id' => $pcs->id, 'price' => 35, 'cost' => 24, 'tax_id' => null, 'stock' => 90, 'alert_qty' => 25],
            ['name' => 'Instant Noodles', 'sku' => 'PRD-011', 'barcode' => '8900000000116', 'category_id' => $snacks->id, 'brand_id' => $square->id, 'unit_id' => $pcs->id, 'price' => 18, 'cost' => 12, 'tax_id' => null, 'stock' => 6, 'alert_qty' => 30],
            ['name' => 'Full Cream Milk 1L', 'sku' => 'PRD-012', 'barcode' => '8900000000123', 'category_id' => $dairy->id, 'brand_id' => $pran->id, 'unit_id' => $ltr->id, 'price' => 95, 'cost' => 78, 'tax_id' => $vat5->id, 'stock' => 60, 'alert_qty' => 15, 'expiry_date' => '2026-09-30'],
            ['name' => 'Butter 200g', 'sku' => 'PRD-013', 'barcode' => '8900000000130', 'category_id' => $dairy->id, 'brand_id' => $nestle->id, 'unit_id' => $pcs->id, 'price' => 180, 'cost' => 145, 'tax_id' => $vat5->id, 'stock' => 25, 'alert_qty' => 10, 'expiry_date' => '2026-12-31'],
            ['name' => 'Yogurt 500g', 'sku' => 'PRD-014', 'barcode' => '8900000000147', 'category_id' => $dairy->id, 'brand_id' => $aci->id, 'unit_id' => $pcs->id, 'price' => 70, 'cost' => 52, 'tax_id' => $vat5->id, 'stock' => 4, 'alert_qty' => 12, 'expiry_date' => '2026-08-15'],
            ['name' => 'Bath Soap 100g', 'sku' => 'PRD-015', 'barcode' => '8900000000154', 'category_id' => $personal->id, 'brand_id' => $unilever->id, 'unit_id' => $pcs->id, 'price' => 55, 'cost' => 40, 'tax_id' => $vat15->id, 'stock' => 150, 'alert_qty' => 30],
            ['name' => 'Shampoo 200ml', 'sku' => 'PRD-016', 'barcode' => '8900000000161', 'category_id' => $personal->id, 'brand_id' => $unilever->id, 'unit_id' => $pcs->id, 'price' => 210, 'cost' => 165, 'tax_id' => $vat15->id, 'stock' => 45, 'alert_qty' => 15],
            ['name' => 'Toothpaste 100g', 'sku' => 'PRD-017', 'barcode' => '8900000000178', 'category_id' => $personal->id, 'brand_id' => $square->id, 'unit_id' => $pcs->id, 'price' => 95, 'cost' => 70, 'tax_id' => $vat15->id, 'stock' => 80, 'alert_qty' => 20],
            ['name' => 'Hand Sanitizer 250ml', 'sku' => 'PRD-018', 'barcode' => '8900000000185', 'category_id' => $personal->id, 'brand_id' => $aci->id, 'unit_id' => $pcs->id, 'price' => 120, 'cost' => 85, 'tax_id' => $vat15->id, 'stock' => 35, 'alert_qty' => 10, 'expiry_date' => '2027-06-30'],
            ['name' => 'Detergent Powder 1kg', 'sku' => 'PRD-019', 'barcode' => '8900000000192', 'category_id' => $household->id, 'brand_id' => $unilever->id, 'unit_id' => $kg->id, 'price' => 150, 'cost' => 118, 'tax_id' => $vat15->id, 'stock' => 55, 'alert_qty' => 15],
            ['name' => 'Dishwashing Liquid 500ml', 'sku' => 'PRD-020', 'barcode' => '8900000000208', 'category_id' => $household->id, 'brand_id' => $aci->id, 'unit_id' => $pcs->id, 'price' => 130, 'cost' => 98, 'tax_id' => $vat15->id, 'stock' => 40, 'alert_qty' => 12],
            ['name' => 'Floor Cleaner 1L', 'sku' => 'PRD-021', 'barcode' => '8900000000215', 'category_id' => $household->id, 'brand_id' => $generic->id, 'unit_id' => $ltr->id, 'price' => 140, 'cost' => 105, 'tax_id' => $vat15->id, 'stock' => 9, 'alert_qty' => 10],
            ['name' => 'Cooking Oil 1L', 'sku' => 'PRD-022', 'barcode' => '8900000000222', 'category_id' => $grocery->id, 'brand_id' => $pran->id, 'unit_id' => $ltr->id, 'price' => 175, 'cost' => 150, 'tax_id' => $vat5->id, 'stock' => 200, 'alert_qty' => 40],
            ['name' => 'Sugar 1kg', 'sku' => 'PRD-023', 'barcode' => '8900000000239', 'category_id' => $grocery->id, 'brand_id' => $generic->id, 'unit_id' => $kg->id, 'price' => 120, 'cost' => 100, 'tax_id' => null, 'stock' => 300, 'alert_qty' => 50],
            ['name' => 'Salt 1kg', 'sku' => 'PRD-024', 'barcode' => '8900000000246', 'category_id' => $grocery->id, 'brand_id' => $aci->id, 'unit_id' => $kg->id, 'price' => 38, 'cost' => 28, 'tax_id' => null, 'stock' => 250, 'alert_qty' => 40],
            ['name' => 'Lentils (Masoor) 1kg', 'sku' => 'PRD-025', 'barcode' => '8900000000253', 'category_id' => $grocery->id, 'brand_id' => $generic->id, 'unit_id' => $kg->id, 'price' => 135, 'cost' => 110, 'tax_id' => null, 'stock' => 180, 'alert_qty' => 30],
            ['name' => 'Vitamin C 1000mg', 'sku' => 'PRD-026', 'barcode' => '8900000000260', 'category_id' => $pharmacy->id, 'brand_id' => $square->id, 'unit_id' => $pcs->id, 'price' => 8, 'cost' => 5, 'tax_id' => null, 'stock' => 500, 'alert_qty' => 60, 'expiry_date' => '2027-03-31'],
            ['name' => 'Antiseptic Liquid 100ml', 'sku' => 'PRD-027', 'barcode' => '8900000000277', 'category_id' => $pharmacy->id, 'brand_id' => $aci->id, 'unit_id' => $pcs->id, 'price' => 65, 'cost' => 45, 'tax_id' => null, 'stock' => 7, 'alert_qty' => 15, 'expiry_date' => '2026-11-30'],
            ['name' => 'Ballpoint Pen (Box of 10)', 'sku' => 'PRD-028', 'barcode' => '8900000000284', 'category_id' => $stationery->id, 'brand_id' => $generic->id, 'unit_id' => $pcs->id, 'price' => 100, 'cost' => 70, 'tax_id' => $vat15->id, 'stock' => 60, 'alert_qty' => 15],
            ['name' => 'A4 Paper Ream', 'sku' => 'PRD-029', 'barcode' => '8900000000291', 'category_id' => $stationery->id, 'brand_id' => $generic->id, 'unit_id' => $pcs->id, 'price' => 420, 'cost' => 350, 'tax_id' => $vat15->id, 'stock' => 30, 'alert_qty' => 10],
            ['name' => 'Notebook 200 pages', 'sku' => 'PRD-030', 'barcode' => '8900000000307', 'category_id' => $stationery->id, 'brand_id' => $generic->id, 'unit_id' => $pcs->id, 'price' => 60, 'cost' => 40, 'tax_id' => null, 'stock' => 110, 'alert_qty' => 25],
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

        // --- Sample sales (so Sales History / Dashboard / Reports have data) ---
        if (\App\Models\Sale::count() === 0) {
            $saleService = app(\App\Services\SaleService::class);
            $byId = Product::pluck('id', 'sku');

            $sampleSales = [
                ['items' => [['product_id' => $byId['PRD-001'], 'qty' => 2, 'price' => 20], ['product_id' => $byId['PRD-003'], 'qty' => 1, 'price' => 45]], 'paid' => 200],
                ['items' => [['product_id' => $byId['PRD-002'], 'qty' => 1, 'price' => 30], ['product_id' => $byId['PRD-005'], 'qty' => 10, 'price' => 2]], 'paid' => 100],
                ['items' => [['product_id' => $byId['PRD-004'], 'qty' => 3, 'price' => 75]], 'paid' => 225],
            ];

            foreach ($sampleSales as $sale) {
                $saleService->create([...$sale, 'payment_method' => 'cash'], $admin->id);
            }
        }
    }
}
