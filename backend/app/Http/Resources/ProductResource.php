<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'sku' => $this->sku,
            'barcode' => $this->barcode,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => $this->category?->name),
            'brand_id' => $this->brand_id,
            'brand' => $this->whenLoaded('brand', fn () => $this->brand?->name),
            'unit_id' => $this->unit_id,
            'unit' => $this->whenLoaded('unit', fn () => $this->unit?->short_name),
            'tax_id' => $this->tax_id,
            'tax_rate' => (float) ($this->tax?->rate ?? 0),
            'price' => (float) $this->price,
            'cost' => (float) $this->cost,
            'stock' => (float) $this->stock,
            'alert_qty' => (float) $this->alert_qty,
            'low_stock' => $this->stock <= $this->alert_qty,
            'image' => $this->image,
            'expiry_date' => $this->expiry_date?->toDateString(),
            'is_active' => (bool) $this->is_active,
        ];
    }
}
