<?php

namespace App\Http\Controllers;

use App\Http\Requests\SendCodeRequest;
use App\Http\Requests\VerifyCodeRequest;
use App\Services\SmsService;
use App\Services\VerificationService;

class VerificationController extends Controller
{
    public function __construct(private VerificationService $verification)
    {
    }

    public function send(SendCodeRequest $request, SmsService $sms)
    {
        $code = $this->verification->sendCode($request->phone);

        $response = ['message' => 'Código enviado por SMS.'];

        // APENAS DESENVOLVIMENTO: devolve o código para facilitar os testes sem Twilio.
        if ($sms->isDevMode()) {
            $response['dev_code'] = $code;
        }

        return response()->json($response);
    }

    public function verify(VerifyCodeRequest $request)
    {
        $this->verification->verifyCode($request->phone, $request->code);

        return response()->json([
            'message' => 'Telefone confirmado.',
            'phone' => $request->phone,
            'token' => $this->verification->createToken($request->phone),
        ]);
    }
}
