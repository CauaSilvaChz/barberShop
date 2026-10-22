<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    protected $fillable = [
        'name',
        'duration_minutes',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'duration_minutes' => 'integer',
            'active' => 'boolean',
        ];
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }
}
