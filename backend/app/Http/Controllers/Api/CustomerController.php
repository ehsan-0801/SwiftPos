<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Http\Resources\SaleResource;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::query()->with('group');

        if ($search = $request->query('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return CustomerResource::collection($query->latest()->paginate($request->integer('per_page', 20)));
    }

    public function store(StoreCustomerRequest $request)
    {
        $customer = Customer::create($request->validated());

        return new CustomerResource($customer->load('group'));
    }

    public function show(Customer $customer)
    {
        return new CustomerResource($customer->load('group'));
    }

    public function update(StoreCustomerRequest $request, Customer $customer)
    {
        $customer->update($request->validated());

        return new CustomerResource($customer->load('group'));
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();

        return response()->json(['message' => 'Customer deleted.']);
    }

    /** Quick search for the POS customer picker. */
    public function search(Request $request)
    {
        $search = $request->query('q', '');

        $customers = Customer::query()
            ->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            })
            ->limit(15)
            ->get();

        return CustomerResource::collection($customers);
    }

    /** A customer's sale (purchase) history. */
    public function history(Customer $customer)
    {
        $sales = $customer->sales()->with(['items.product', 'user'])->latest()->paginate(20);

        return SaleResource::collection($sales);
    }
}
