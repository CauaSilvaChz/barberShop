<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ServiceRequest;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Illuminate\Http\Request;

/**
 * Não existe rota de exclusão: serviços são apenas desativados,
 * para não perder o histórico dos agendamentos.
 */
class ServiceController extends Controller
{
    public function index()
    {
        return ServiceResource::collection(Service::orderBy('id')->get());
    }

    public function store(ServiceRequest $request)
    {
        $service = Service::create($request->validated());

        return (new ServiceResource($service))->response()->setStatusCode(201);
    }

    public function update(ServiceRequest $request, Service $service)
    {
        $service->update($request->validated());

        return new ServiceResource($service);
    }

    public function updateStatus(Request $request, Service $service)
    {
        $request->validate(['active' => ['required', 'boolean']]);

        $service->update(['active' => $request->boolean('active')]);

        return new ServiceResource($service);
    }
}
