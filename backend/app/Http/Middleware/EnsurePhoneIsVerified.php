<?php

namespace App\Http\Middleware;

use App\Services\VerificationService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Exige o token de telefone (header X-Customer-Token) gerado após a
 * confirmação do código SMS. O telefone confirmado fica disponível em
 * $request->attributes->get('verified_phone').
 */
class EnsurePhoneIsVerified
{
    public function __construct(private VerificationService $verification)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $phone = $this->verification->phoneFromToken($request->header('X-Customer-Token'));

        if (! $phone) {
            return response()->json(['message' => 'Confirme seu telefone para continuar.'], 401);
        }

        $request->attributes->set('verified_phone', $phone);

        return $next($request);
    }
}
