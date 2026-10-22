<?php

namespace App\Http\Controllers;

use App\Http\Requests\AvailabilityRequest;
use App\Models\Service;
use App\Services\AvailabilityService;
use Illuminate\Support\Carbon;

class AvailabilityController extends Controller
{
    public function __invoke(AvailabilityRequest $request, AvailabilityService $availability)
    {
        $service = Service::findOrFail($request->service_id);
        $date = Carbon::parse($request->date);

        return response()->json([
            'date' => $date->format('Y-m-d'),
            'service_id' => $service->id,
            'slots' => $availability->slotsForDay($date, $service),
        ]);
    }
}
