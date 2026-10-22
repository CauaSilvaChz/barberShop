<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'service_id',
        'customer_name',
        'customer_phone',
        'start_at',
        'end_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'start_at' => 'datetime',
            'end_at' => 'datetime',
        ];
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Agendamentos confirmados que se sobrepõem ao intervalo [start, end).
     */
    public function scopeOverlapping(Builder $query, $start, $end): Builder
    {
        return $query
            ->where('status', self::STATUS_CONFIRMED)
            ->where('start_at', '<', $end)
            ->where('end_at', '>', $start);
    }

    /**
     * Regra simples de status: só um agendamento confirmado pode mudar
     * (para concluído ou cancelado). Cancelado/concluído não volta atrás.
     */
    public function canChangeStatus(): bool
    {
        return $this->status === self::STATUS_CONFIRMED;
    }

    public function canBeCancelledByCustomer(): bool
    {
        return $this->status === self::STATUS_CONFIRMED && $this->start_at->isFuture();
    }
}
