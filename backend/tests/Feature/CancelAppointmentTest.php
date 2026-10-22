<?php

namespace Tests\Feature;

use App\Models\Appointment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class CancelAppointmentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedServices();
        $this->travelTo(Carbon::parse('2026-10-01 09:00'));
    }

    public function test_customer_can_cancel_a_future_appointment_and_the_slot_becomes_free(): void
    {
        $appointment = $this->createAppointment('Corte', '2026-10-02 10:00');

        $this->patchJson("/api/appointments/{$appointment->id}/cancel", [], $this->customerHeaders())
            ->assertOk()
            ->assertJson(['status' => 'cancelled']);

        $slots = collect($this->getJson('/api/availability?date=2026-10-02&service_id='.$this->service('Corte')->id)->json('slots'));
        $this->assertTrue($slots->firstWhere('time', '10:00')['available']);
    }

    public function test_customer_only_sees_and_cancels_their_own_appointments(): void
    {
        $mine = $this->createAppointment('Corte', '2026-10-02 10:00', '11999998888');
        $other = $this->createAppointment('Corte', '2026-10-02 11:00', '21988887777');

        $this->getJson('/api/my-appointments', $this->customerHeaders('11999998888'))
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $mine->id);

        $this->patchJson("/api/appointments/{$other->id}/cancel", [], $this->customerHeaders('11999998888'))
            ->assertNotFound();

        $this->assertSame(Appointment::STATUS_CONFIRMED, $other->fresh()->status);
    }

    public function test_my_appointments_requires_a_verified_phone(): void
    {
        $this->getJson('/api/my-appointments')->assertUnauthorized();
    }

    public function test_customer_cannot_cancel_a_past_appointment(): void
    {
        $appointment = $this->createAppointment('Corte', '2026-10-01 08:00');

        $this->patchJson("/api/appointments/{$appointment->id}/cancel", [], $this->customerHeaders())
            ->assertUnprocessable()
            ->assertJson(['message' => 'Não é possível cancelar um agendamento que já passou.']);
    }

    public function test_customer_cannot_cancel_a_completed_appointment(): void
    {
        $appointment = $this->createAppointment('Corte', '2026-10-02 10:00', status: Appointment::STATUS_COMPLETED);

        $this->patchJson("/api/appointments/{$appointment->id}/cancel", [], $this->customerHeaders())
            ->assertUnprocessable()
            ->assertJson(['message' => 'Somente agendamentos confirmados podem ser cancelados.']);
    }
}
