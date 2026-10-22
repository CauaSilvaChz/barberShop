<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VerificationCode extends Model
{
    protected $fillable = [
        'phone',
        'code',
        'expires_at',
        'used_at',
        'attempts',
    ];

    protected $hidden = [
        'code',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'used_at' => 'datetime',
            'attempts' => 'integer',
        ];
    }
}
