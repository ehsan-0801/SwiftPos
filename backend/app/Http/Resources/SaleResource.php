<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_no' => $this->invoice_no,
            'customer_id' => $this->customer_id,
            'customer' => $this->whenLoaded('customer', fn () => $this->customer?->name ?? 'Walk-in'),
            'cashier' => $this->whenLoaded('user', fn () => $this->user?->name),
            'subtotal' => (float) $this->subtotal,
            'discount' => (float) $this->discount,
            'tax' => (float) $this->tax,
            'total' => (float) $this->total,
            'paid' => (float) $this->paid,
            'change' => (float) $this->change,
            'payment_status' => $this->payment_status,
            'sale_status' => $this->sale_status,
            'note' => $this->note,
            'created_at' => $this->created_at?->toIso8601String(),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($i) => [
                'product_id' => $i->product_id,
                'name' => $i->product?->name,
                'qty' => (float) $i->qty,
                'price' => (float) $i->price,
                'discount' => (float) $i->discount,
                'total' => (float) $i->total,
            ])),
        ];
    }
}
