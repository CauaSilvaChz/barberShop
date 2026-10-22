<?php

use Illuminate\Support\Facades\Route;

// Este projeto é somente API. As rotas ficam em routes/api.php.
Route::get('/', fn () => response()->json(['name' => 'Barbearia API', 'status' => 'ok']));
