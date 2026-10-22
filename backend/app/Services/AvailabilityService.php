<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\BlockedTime;
use App\Models\Service;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

/**
 * Regras de horário da barbearia.
 * Usado tanto para listar horários livres quanto para a verificação
 * definitiva no momento de criar um agendamento.
 */
class AvailabilityService
{
    public const OPENING_TIME = '08:00';
    public const CLOSING_TIME = '20:00';
    public const SLOT_MINUTES = 30;

    /**
     * Retorna todos os horários do dia para o serviço informado,
     * indicando quais estão disponíveis.
     *
     * @return array<int, array{time: string, available: bool}>
     */
    public function slotsForDay(Carbon $date, Service $service): array
    {
        $opening = $date->copy()->setTimeFromTimeString(self::OPENING_TIME);
        $closing = $date->copy()->setTimeFromTimeString(self::CLOSING_TIME);

        // Busca tudo que ocupa o dia de uma vez, para não fazer uma consulta por horário.
        $busyPeriods = Appointment::overlapping($opening, $closing)->get(['start_at', 'end_at'])
            ->concat(BlockedTime::overlapping($opening, $closing)->get(['start_at', 'end_at']));

        $slots = [];
        $start = $opening->copy();

        // O serviço precisa terminar até o fechamento (ex.: Luzes, 60 min, no máximo às 19:00).
        while ($start->copy()->addMinutes($service->duration_minutes)->lte($closing)) {
            // Só pra eu lembrar depois, o end aqui é o end do serviço, não o horário de fechamento.
            // Ai define o horário de encerramento de um serviço. que é o inicio + o tempo de duração do serviço.
            $end = $start->copy()->addMinutes($service->duration_minutes);

            // Testa a função em cada item e retorna true assim que a condição for satisfeita
            $isBusy = $busyPeriods->contains(
                fn ($period) => $period->start_at->lt($end) && $period->end_at->gt($start)
            );

            $slots[] = [
                'time' => $start->format('H:i'),
                'available' => $start->isFuture() && ! $isBusy,
            ];

            $start->addMinutes(self::SLOT_MINUTES);
        }

        return $slots;
    }

    /**
     * Verificação definitiva feita no backend antes de salvar o agendamento.
     *
     * @throws ValidationException
     */
    public function ensureSlotIsAvailable(Carbon $start, Service $service): void
    {
        $end = $start->copy()->addMinutes($service->duration_minutes);
        $opening = $start->copy()->setTimeFromTimeString(self::OPENING_TIME);
        $closing = $start->copy()->setTimeFromTimeString(self::CLOSING_TIME);

        $isAlignedToSlot = $start->minute % self::SLOT_MINUTES === 0 && $start->second === 0;

        if (! $isAlignedToSlot || $start->lt($opening) || $end->gt($closing)) {
            throw ValidationException::withMessages(['time' => 'Horário fora do expediente.']);
        }

        if (! $start->isFuture()) {
            throw ValidationException::withMessages(['time' => 'Não é possível agendar em um horário que já passou.']);
        }

        $hasConflict = Appointment::overlapping($start, $end)->exists()
            || BlockedTime::overlapping($start, $end)->exists();

        if ($hasConflict) {
            throw ValidationException::withMessages(['time' => 'Horário não disponível.']);
        }
    }
}
