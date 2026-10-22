<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class BlockedTime extends Model
{
    protected $fillable = [
        'start_at',
        'end_at',
        'reason',
    ];

    protected function casts(): array
    {
        return [
            'start_at' => 'datetime',
            'end_at' => 'datetime',
        ];
    }

    /**
     * Bloqueios que se sobrepõem ao intervalo [start, end).
     */
    public function scopeOverlapping(Builder $query, $start, $end): Builder
    {
        return $query
            ->where('start_at', '<', $end)
            ->where('end_at', '>', $start);
    }
}
