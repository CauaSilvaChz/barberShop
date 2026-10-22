<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBlockedTimeRequest;
use App\Http\Resources\BlockedTimeResource;
use App\Models\Appointment;
use App\Models\BlockedTime;
use Illuminate\Support\Carbon;

class BlockedTimeController extends Controller
{
    /**
     * Lista os bloqueios que ainda não terminaram.
     */
    public function index()
    {
        $blockedTimes = BlockedTime::where('end_at', '>=', now())
            ->orderBy('start_at')
            ->get();

        return BlockedTimeResource::collection($blockedTimes);
    }

    public function store(StoreBlockedTimeRequest $request)
    {
        $startAt = Carbon::parse($request->date.' '.$request->start_time);
        $endAt = Carbon::parse($request->date.' '.$request->end_time);

        if (Appointment::overlapping($startAt, $endAt)->exists()) {
            return response()->json([
                'message' => 'Existem agendamentos confirmados neste período. Cancele-os antes de bloquear.',
            ], 422);
        }

        $blockedTime = BlockedTime::create([
            'start_at' => $startAt,
            'end_at' => $endAt,
            'reason' => $request->reason,
        ]);

        return (new BlockedTimeResource($blockedTime))->response()->setStatusCode(201);
    }

    public function destroy(BlockedTime $blockedTime)
    {
        $blockedTime->delete();

        return response()->noContent();
    }
}
