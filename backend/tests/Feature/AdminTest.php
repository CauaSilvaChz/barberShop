<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedServices();
        $this->travelTo(Carbon::parse('2026-10-01 09:00'));
    }

    public function test_admin_can_login_and_use_the_token(): void
    {
        User::factory()->create(['email' => 'admin@barbearia.com']);

        $token = $this->postJson('/api/login', [
            'email' => 'admin@barbearia.com',
            'password' => 'password',
        ])->assertOk()->json('token');

        $this->getJson('/api/admin/appointments', ['Authorization' => "Bearer {$token}"])
            ->assertOk();
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create(['email' => 'admin@barbearia.com']);

        $this->postJson('/api/login', [
            'email' => 'admin@barbearia.com',
            'password' => 'senha-errada',
        ])->assertUnprocessable()->assertJson(['message' => 'E-mail ou senha inválidos.']);
    }

    public function test_admin_routes_require_authentication(): void
    {
        $this->getJson('/api/admin/appointments')->assertUnauthorized();
        $this->getJson('/api/admin/services')->assertUnauthorized();
        $this->getJson('/api/admin/blocked-times')->assertUnauthorized();
    }

    public function test_admin_can_complete_a_confirmed_appointment_but_not_reopen_a_cancelled_one(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $confirmed = $this->createAppointment('Corte', '2026-10-01 10:00');
        $cancelled = $this->createAppointment('Corte', '2026-10-01 11:00', status: Appointment::STATUS_CANCELLED);

        $this->patchJson("/api/admin/appointments/{$confirmed->id}/status", ['status' => 'completed'])
            ->assertOk()
            ->assertJson(['status' => 'completed']);

        $this->patchJson("/api/admin/appointments/{$cancelled->id}/status", ['status' => 'completed'])
            ->assertUnprocessable();

        $this->patchJson("/api/admin/appointments/{$cancelled->id}/status", ['status' => 'confirmed'])
            ->assertUnprocessable();
    }

    public function test_blocked_time_cannot_overlap_confirmed_appointments(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->createAppointment('Corte', '2026-10-02 12:00');

        $this->postJson('/api/admin/blocked-times', [
            'date' => '2026-10-02',
            'start_time' => '12:00',
            'end_time' => '13:00',
            'reason' => 'Almoço',
        ])->assertUnprocessable();

        $this->postJson('/api/admin/blocked-times', [
            'date' => '2026-10-02',
            'start_time' => '13:00',
            'end_time' => '14:00',
            'reason' => 'Almoço',
        ])->assertCreated();
    }
}
