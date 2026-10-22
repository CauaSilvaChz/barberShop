<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Envio de SMS via API REST do Twilio.
 *
 * MODO DESENVOLVIMENTO (SMS_DEV_MODE=true): nenhum SMS é enviado,
 * a mensagem é apenas gravada em storage/logs/laravel.log.
 * Esse modo é ignorado quando APP_ENV=production.
 */
class SmsService
{
    public function isDevMode(): bool
    {
        return config('services.sms.dev_mode') && ! app()->isProduction();
    }

    public function send(string $phone, string $message): void
    {
        if ($this->isDevMode()) {
            Log::info("[SMS - MODO DESENVOLVIMENTO] Para {$phone}: {$message}");

            return;
        }

        $sid = config('services.twilio.sid');

        $response = Http::asForm()
            ->withBasicAuth($sid, config('services.twilio.token'))
            ->post("https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json", [
                'From' => config('services.twilio.from'),
                'To' => '+55'.$phone, // telefones são salvos só com DDD + número
                'Body' => $message,
            ]);

        if ($response->failed()) {
            Log::error('Falha ao enviar SMS pelo Twilio.', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            abort(503, 'Não foi possível enviar o SMS. Tente novamente em instantes.');
        }
    }
}
