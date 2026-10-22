<?php

namespace App\Http\Controllers;

use App\Http\Resources\ServiceResource;
use App\Models\Service;

class ServiceController extends Controller
{
    /**
     * Serviços ativos exibidos para o cliente.
     */
    public function index()
    {
        $services = Service::where('active', true)->orderBy('id')->get();

        return ServiceResource::collection($services);
    }
}
