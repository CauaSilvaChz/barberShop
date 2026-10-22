<?php

use App\Http\Controllers\Admin\AppointmentController as AdminAppointmentController;
use App\Http\Controllers\Admin\BlockedTimeController;
use App\Http\Controllers\Admin\ServiceController as AdminServiceController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AvailabilityController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\VerificationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Área pública (cliente)
|--------------------------------------------------------------------------
*/

Route::get('/services', [ServiceController::class, 'index']);
Route::get('/availability', AvailabilityController::class);

// Limite simples de requisições por IP (throttle:tentativas,minutos).
Route::post('/verification/send', [VerificationController::class, 'send'])->middleware('throttle:5,1');
Route::post('/verification/verify', [VerificationController::class, 'verify'])->middleware('throttle:10,1');

// Exigem o token recebido após confirmar o código SMS (header X-Customer-Token).
Route::middleware('customer')->group(function () {
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/my-appointments', [AppointmentController::class, 'index']);
    Route::patch('/appointments/{id}/cancel', [AppointmentController::class, 'cancel'])->whereNumber('id');
});

/*
|--------------------------------------------------------------------------
| Área administrativa (barbeiro)
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::prefix('admin')->group(function () {
        Route::get('/appointments', [AdminAppointmentController::class, 'index']);
        Route::patch('/appointments/{appointment}/status', [AdminAppointmentController::class, 'updateStatus']);

        Route::get('/services', [AdminServiceController::class, 'index']);
        Route::post('/services', [AdminServiceController::class, 'store']);
        Route::put('/services/{service}', [AdminServiceController::class, 'update']);
        Route::patch('/services/{service}/status', [AdminServiceController::class, 'updateStatus']);

        Route::get('/blocked-times', [BlockedTimeController::class, 'index']);
        Route::post('/blocked-times', [BlockedTimeController::class, 'store']);
        Route::delete('/blocked-times/{blockedTime}', [BlockedTimeController::class, 'destroy']);
    });
});
