<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference_no' => $this->reference_no,
            'supplier_id' => $this->supplier_id,
            'supplier' => $this->whenLoaded('supplier', fn () => $this->supplier?->name),
            'user' => $this->whenLoaded('user', fn () => $this->user?->name),
            'subtotal' => (float) $this->subtotal,
            'discount' => (float) $this->discount,
            'tax' => (float) $this->tax,
            'total' => (float) $this->total,
            'paid' => (float) $this->paid,
            'payment_status' => $this->payment_status,
            'created_at' => $this->created_at?->toIso8601String(),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($i) => [
                'product_id' => $i->product_id,
                'name' => $i->product?->name,
                'qty' => (float) $i->qty,
                'cost' => (float) $i->cost,
                'total' => (float) $i->total,
            ])),
        ];
    }
}
