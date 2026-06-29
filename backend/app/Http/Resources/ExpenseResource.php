<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => $this->category?->name),
            'amount' => (float) $this->amount,
            'note' => $this->note,
            'date' => $this->date?->toDateString(),
            'user' => $this->whenLoaded('user', fn () => $this->user?->name),
        ];
    }
}
