<?php

namespace Tests\Feature;

use App\Models\VerificationCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VerificationCodeTest extends TestCase
{
    use RefreshDatabase;

    private function sendCode(string $phone = '(11) 99999-8888'): string
    {
        return $this->postJson('/api/verification/send', ['phone' => $phone])
            ->assertOk()
            ->json('dev_code');
    }

    private function verify(string $code, string $phone = '11999998888')
    {
        return $this->postJson('/api/verification/verify', ['phone' => $phone, 'code' => $code]);
    }

    public function test_code_is_created_with_six_digits_and_stored_hashed(): void
    {
        $code = $this->sendCode();

        $this->assertMatchesRegularExpression('/^\d{6}$/', $code);

        $stored = VerificationCode::first();
        $this->assertSame('11999998888', $stored->phone); // telefone salvo só com números
        $this->assertNotSame($code, $stored->code);       // nunca em texto puro
    }

    public function test_correct_code_returns_a_token_that_gives_access_to_appointments(): void
    {
        $code = $this->sendCode();

        $token = $this->verify($code)
            ->assertOk()
            ->assertJsonStructure(['token'])
            ->json('token');

        $this->getJson('/api/my-appointments', ['X-Customer-Token' => $token])->assertOk();
    }

    public function test_wrong_code_is_rejected_and_counts_as_an_attempt(): void
    {
        $this->sendCode();

        $this->verify('000000')->assertUnprocessable();

        $this->assertSame(1, VerificationCode::first()->attempts);
    }

    public function test_code_can_only_be_used_once(): void
    {
        $code = $this->sendCode();

        $this->verify($code)->assertOk();
        $this->verify($code)
            ->assertUnprocessable()
            ->assertJson(['message' => 'Código expirado ou já utilizado. Solicite um novo código.']);
    }

    public function test_code_expires_after_five_minutes(): void
    {
        $code = $this->sendCode();

        $this->travel(6)->minutes();

        $this->verify($code)
            ->assertUnprocessable()
            ->assertJson(['message' => 'Código expirado ou já utilizado. Solicite um novo código.']);
    }

    public function test_code_is_blocked_after_too_many_attempts(): void
    {
        $code = $this->sendCode();

        for ($i = 0; $i < 5; $i++) {
            $this->verify($code === '111111' ? '222222' : '111111')->assertUnprocessable();
        }

        // Mesmo o código correto é recusado depois do limite
        $this->verify($code)
            ->assertUnprocessable()
            ->assertJson(['message' => 'Muitas tentativas. Solicite um novo código.']);
    }

    public function test_cannot_request_a_new_code_immediately(): void
    {
        $this->sendCode();

        $this->postJson('/api/verification/send', ['phone' => '11999998888'])
            ->assertUnprocessable()
            ->assertJson(['message' => 'Aguarde 10 segundos antes de solicitar um novo código.']);
    }

    public function test_invalid_phone_is_rejected(): void
    {
        $this->postJson('/api/verification/send', ['phone' => '1234'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('phone');
    }
}
