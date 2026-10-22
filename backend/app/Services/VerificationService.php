<?php

namespace App\Services;

use App\Models\VerificationCode;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Confirmação de telefone por código SMS.
 *
 * Depois que o código é confirmado, o cliente recebe um "token de telefone":
 * um texto criptografado com a APP_KEY contendo o telefone e a validade.
 * Esse token é enviado no header X-Customer-Token para criar, listar e
 * cancelar agendamentos, sem precisar de conta/senha para o cliente.
 */
class VerificationService
{
    public const CODE_EXPIRES_MINUTES = 5;
    public const MAX_ATTEMPTS = 5;
    public const RESEND_WAIT_SECONDS = 10;
    public const TOKEN_EXPIRES_MINUTES = 30;

    public function __construct(private SmsService $sms)
    {
    }

    /**
     * Gera, salva (com hash) e envia um novo código. Retorna o código gerado.
     */
    public function sendCode(string $phone): string
    {
        $lastCode = VerificationCode::where('phone', $phone)->latest('id')->first();

        if ($lastCode && $lastCode->created_at->gt(now()->subSeconds(self::RESEND_WAIT_SECONDS))) {
            throw ValidationException::withMessages([
                'phone' => 'Aguarde 10 segundos antes de solicitar um novo código.',
            ]);
        }

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        VerificationCode::create([
            'phone' => $phone,
            'code' => Hash::make($code),
            'expires_at' => now()->addMinutes(self::CODE_EXPIRES_MINUTES),
        ]);

        $this->sms->send($phone, "Barbearia: seu código de confirmação é {$code}. Ele expira em 5 minutos.");

        return $code;
    }

    /**
     * Confere o código. Apenas o último código enviado para o telefone é válido.
     *
     * @throws ValidationException
     */
    public function verifyCode(string $phone, string $code): void
    {
        $verification = VerificationCode::where('phone', $phone)->latest('id')->first();

        if (! $verification || $verification->used_at || $verification->expires_at->isPast()) {
            throw ValidationException::withMessages([
                'code' => 'Código expirado ou já utilizado. Solicite um novo código.',
            ]);
        }

        if ($verification->attempts >= self::MAX_ATTEMPTS) {
            throw ValidationException::withMessages([
                'code' => 'Muitas tentativas. Solicite um novo código.',
            ]);
        }

        $verification->increment('attempts');

        if (! Hash::check($code, $verification->code)) {
            throw ValidationException::withMessages(['code' => 'Código inválido.']);
        }

        $verification->update(['used_at' => now()]);
    }

    public function createToken(string $phone): string
    {
        return Crypt::encryptString(json_encode([
            'phone' => $phone,
            'expires_at' => now()->addMinutes(self::TOKEN_EXPIRES_MINUTES)->timestamp,
        ]));
    }

    /**
     * Retorna o telefone contido no token, ou null se o token for inválido/expirado.
     */
    public function phoneFromToken(?string $token): ?string
    {
        if (! $token) {
            return null;
        }

        try {
            $data = json_decode(Crypt::decryptString($token), true);
        } catch (DecryptException) {
            return null;
        }

        if (! isset($data['phone'], $data['expires_at']) || $data['expires_at'] < now()->timestamp) {
            return null;
        }

        return $data['phone'];
    }
}
