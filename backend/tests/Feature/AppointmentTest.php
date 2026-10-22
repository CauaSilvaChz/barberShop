<?php

namespace Tests\Feature;

use App\Models\BlockedTime;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class AppointmentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedServices();
        // "Agora" nos testes: 01/10/2026 às 09:00 (America/Sao_Paulo)
        $this->travelTo(Carbon::parse('2026-10-01 09:00'));
    }

    private function book(string $serviceName, string $date, string $time, ?array $headers = null)
    {
        return $this->postJson('/api/appointments', [
            'service_id' => $this->service($serviceName)->id,
            'date' => $date,
            'time' => $time,
            'customer_name' => 'João Silva',
        ], $headers ?? $this->customerHeaders());
    }

    public function test_customer_can_book_an_available_slot(): void
    {
        $response = $this->book('Corte', '2026-10-02', '10:00');

        $response->assertCreated()
            ->assertJson([
                'customer_name' => 'João Silva',
                'customer_phone' => '11999998888',
                'date' => '2026-10-02',
                'time' => '10:00',
                'end_time' => '10:30',
                'status' => 'confirmed',
                'service' => ['name' => 'Corte'],
            ]);

        $this->assertDatabaseCount('appointments', 1);
    }

    public function test_booking_requires_a_verified_phone(): void
    {
        $this->book('Corte', '2026-10-02', '10:00', ['X-Customer-Token' => 'token-falso'])
            ->assertUnauthorized();

        $this->assertDatabaseCount('appointments', 0);
    }

    public function test_cannot_book_an_occupied_slot(): void
    {
        $this->book('Corte', '2026-10-02', '10:00')->assertCreated();

        $this->book('Corte e Barba', '2026-10-02', '10:00', $this->customerHeaders('21988887777'))
            ->assertUnprocessable()
            ->assertJson(['message' => 'Horário não disponível.']);

        $this->assertDatabaseCount('appointments', 1);
    }

    public function test_luzes_occupies_one_hour(): void
    {
        $this->book('Luzes', '2026-10-02', '10:00')
            ->assertCreated()
            ->assertJson(['time' => '10:00', 'end_time' => '11:00']);

        // 10:30 está dentro do período de Luzes
        $this->book('Corte', '2026-10-02', '10:30')
            ->assertUnprocessable()
            ->assertJson(['message' => 'Horário não disponível.']);

        // 11:00 já está livre
        $this->book('Corte', '2026-10-02', '11:00')->assertCreated();
    }

    public function test_luzes_cannot_start_if_the_next_slot_is_taken(): void
    {
        $this->createAppointment('Corte', '2026-10-02 10:30');

        $this->book('Luzes', '2026-10-02', '10:00')
            ->assertUnprocessable()
            ->assertJson(['message' => 'Horário não disponível.']);

        $slots = collect($this->getJson('/api/availability?date=2026-10-02&service_id='.$this->service('Luzes')->id)
            ->assertOk()
            ->json('slots'));

        $this->assertFalse($slots->firstWhere('time', '10:00')['available']);
        $this->assertFalse($slots->firstWhere('time', '10:30')['available']);
        $this->assertTrue($slots->firstWhere('time', '11:00')['available']);
    }

    public function test_cannot_book_outside_business_hours(): void
    {
        $this->book('Corte', '2026-10-02', '07:30')
            ->assertUnprocessable()
            ->assertJson(['message' => 'Horário fora do expediente.']);

        $this->book('Corte', '2026-10-02', '20:00')
            ->assertUnprocessable()
            ->assertJson(['message' => 'Horário fora do expediente.']);

        // Luzes às 19:30 terminaria às 20:30
        $this->book('Luzes', '2026-10-02', '19:30')
            ->assertUnprocessable()
            ->assertJson(['message' => 'Horário fora do expediente.']);

        // Horário que não é múltiplo de 30 minutos
        $this->book('Corte', '2026-10-02', '10:15')->assertUnprocessable();

        // Limites válidos: último Corte às 19:30 e última Luzes às 19:00
        $this->book('Corte', '2026-10-02', '19:30')->assertCreated();
        $this->book('Luzes', '2026-10-03', '19:00')->assertCreated();
    }

    public function test_cannot_book_in_the_past(): void
    {
        $this->book('Corte', '2026-09-30', '10:00')
            ->assertUnprocessable()
            ->assertJson(['message' => 'Não é possível agendar em uma data passada.']);

        // Hoje, mas em um horário que já passou (agora são 09:00)
        $this->book('Corte', '2026-10-01', '08:30')
            ->assertUnprocessable()
            ->assertJson(['message' => 'Não é possível agendar em um horário que já passou.']);

        $this->assertDatabaseCount('appointments', 0);
    }

    public function test_cannot_book_a_blocked_time(): void
    {
        BlockedTime::create([
            'start_at' => '2026-10-02 12:00',
            'end_at' => '2026-10-02 13:00',
            'reason' => 'Almoço',
        ]);

        $this->book('Corte', '2026-10-02', '12:30')
            ->assertUnprocessable()
            ->assertJson(['message' => 'Horário não disponível.']);

        // Luzes às 11:30 invadiria o bloqueio das 12:00
        $this->book('Luzes', '2026-10-02', '11:30')->assertUnprocessable();

        $this->book('Corte', '2026-10-02', '13:00')->assertCreated();
    }

    public function test_availability_lists_slots_according_to_service_duration(): void
    {
        $corte = collect($this->getJson('/api/availability?date=2026-10-02&service_id='.$this->service('Corte')->id)->json('slots'));
        $luzes = collect($this->getJson('/api/availability?date=2026-10-02&service_id='.$this->service('Luzes')->id)->json('slots'));

        $this->assertCount(24, $corte); // 08:00 ... 19:30
        $this->assertSame('08:00', $corte->first()['time']);
        $this->assertSame('19:30', $corte->last()['time']);

        $this->assertCount(23, $luzes); // 08:00 ... 19:00
        $this->assertSame('19:00', $luzes->last()['time']);
    }

    public function test_availability_marks_past_times_of_today_as_unavailable(): void
    {
        $slots = collect($this->getJson('/api/availability?date=2026-10-01&service_id='.$this->service('Corte')->id)->json('slots'));

        $this->assertFalse($slots->firstWhere('time', '08:30')['available']);
        $this->assertFalse($slots->firstWhere('time', '09:00')['available']);
        $this->assertTrue($slots->firstWhere('time', '09:30')['available']);
    }

    public function test_availability_rejects_past_dates(): void
    {
        $this->getJson('/api/availability?date=2026-09-30&service_id='.$this->service('Corte')->id)
            ->assertUnprocessable();
    }
}
