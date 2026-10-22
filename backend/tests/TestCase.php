<?php

namespace Tests;

use App\Models\Appointment;
use App\Models\Service;
use App\Services\VerificationService;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Carbon;

abstract class TestCase extends BaseTestCase
{
    protected function seedServices(): void
    {
        Service::create(['name' => 'Corte', 'duration_minutes' => 30]);
        Service::create(['name' => 'Corte e Barba', 'duration_minutes' => 30]);
        Service::create(['name' => 'Luzes', 'duration_minutes' => 60]);
    }

    protected function service(string $name): Service
    {
        return Service::where('name', $name)->firstOrFail();
    }

    /**
     * Headers com o token de telefone confirmado (como se o cliente tivesse digitado o código SMS).
     */
    protected function customerHeaders(string $phone = '11999998888'): array
    {
        return ['X-Customer-Token' => app(VerificationService::class)->createToken($phone)];
    }

    protected function createAppointment(
        string $serviceName,
        string $startAt,
        string $phone = '11999998888',
        string $status = Appointment::STATUS_CONFIRMED,
    ): Appointment {
        $service = $this->service($serviceName);
        $start = Carbon::parse($startAt);

        return Appointment::create([
            'service_id' => $service->id,
            'customer_name' => 'Cliente Teste',
            'customer_phone' => $phone,
            'start_at' => $start,
            'end_at' => $start->copy()->addMinutes($service->duration_minutes),
            'status' => $status,
        ]);
    }
}
