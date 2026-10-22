<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AppointmentController extends Controller
{
    /**
     * Filtros opcionais: date, status, service_id.
     * "upcoming=1" retorna os próximos agendamentos confirmados (usado no dashboard).
     */
    public function index(Request $request)
    {
        $filters = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
            'status' => ['nullable', Rule::in([
                Appointment::STATUS_CONFIRMED,
                Appointment::STATUS_COMPLETED,
                Appointment::STATUS_CANCELLED,
            ])],
            'service_id' => ['nullable', 'integer'],
            'upcoming' => ['nullable', 'boolean'],
        ]);

        $appointments = Appointment::with('service')
            ->when($filters['date'] ?? null, fn ($query, $date) => $query->whereDate('start_at', $date))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['service_id'] ?? null, fn ($query, $serviceId) => $query->where('service_id', $serviceId))
            ->when($request->boolean('upcoming'), fn ($query) => $query
                ->where('status', Appointment::STATUS_CONFIRMED)
                ->where('start_at', '>=', now())
                ->limit(10))
            ->orderBy('start_at')
            ->get();

        return AppointmentResource::collection($appointments);
    }

    public function updateStatus(Request $request, Appointment $appointment)
    {
        $request->validate([
            'status' => ['required', Rule::in([Appointment::STATUS_COMPLETED, Appointment::STATUS_CANCELLED])],
        ]);

        if (! $appointment->canChangeStatus()) {
            return response()->json([
                'message' => 'Somente agendamentos confirmados podem ter o status alterado.',
            ], 422);
        }

        $appointment->update(['status' => $request->status]);

        return new AppointmentResource($appointment->load('service'));
    }
}
