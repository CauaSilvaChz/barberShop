<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use App\Models\Service;
use App\Services\AvailabilityService;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Ações do cliente. Todas exigem o token de telefone confirmado
 * (middleware "customer").
 */
class AppointmentController extends Controller
{
    public function store(StoreAppointmentRequest $request, AvailabilityService $availability)
    {
        $service = Service::findOrFail($request->service_id);
        $startAt = Carbon::parse($request->date.' '.$request->time);

        try {
            // Verifica e cria dentro da mesma transação.
            $appointment = DB::transaction(function () use ($request, $availability, $service, $startAt) {
                $availability->ensureSlotIsAvailable($startAt, $service);

                return Appointment::create([
                    'service_id' => $service->id,
                    'customer_name' => $request->customer_name,
                    'customer_phone' => $request->attributes->get('verified_phone'),
                    'start_at' => $startAt,
                    'end_at' => $startAt->copy()->addMinutes($service->duration_minutes),
                    'status' => Appointment::STATUS_CONFIRMED,
                ]);
            });
        } catch (UniqueConstraintViolationException) {
            // Duas pessoas confirmaram o mesmo horário ao mesmo tempo: o índice único do banco barrou a segunda.
            return response()->json(['message' => 'Horário não disponível.'], 422);
        }

        return (new AppointmentResource($appointment->load('service')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/my-appointments — somente os agendamentos do telefone confirmado.
     */
    public function index(Request $request)
    {
        $appointments = Appointment::with('service')
            ->where('customer_phone', $request->attributes->get('verified_phone'))
            ->orderByDesc('start_at')
            ->get();

        return AppointmentResource::collection($appointments);
    }

    public function cancel(Request $request, int $id)
    {
        // Filtrar pelo telefone impede que um cliente cancele o agendamento de outro.
        $appointment = Appointment::with('service')
            ->where('customer_phone', $request->attributes->get('verified_phone'))
            ->findOrFail($id);

        if ($appointment->status !== Appointment::STATUS_CONFIRMED) {
            return response()->json(['message' => 'Somente agendamentos confirmados podem ser cancelados.'], 422);
        }

        if (! $appointment->canBeCancelledByCustomer()) {
            return response()->json(['message' => 'Não é possível cancelar um agendamento que já passou.'], 422);
        }

        $appointment->update(['status' => Appointment::STATUS_CANCELLED]);

        return new AppointmentResource($appointment);
    }
}
