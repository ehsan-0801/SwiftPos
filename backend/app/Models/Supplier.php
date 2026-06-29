<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'phone', 'email', 'address', 'balance'];

    protected $casts = ['balance' => 'decimal:2'];

    public function purchases(): HasMany
    {
        return $this->hasMany(Purchase::class);
    }
}
