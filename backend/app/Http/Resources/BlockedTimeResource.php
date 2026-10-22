<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlockedTimeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'date' => $this->start_at->format('Y-m-d'),
            'start_time' => $this->start_at->format('H:i'),
            'end_time' => $this->end_at->format('H:i'),
            'reason' => $this->reason,
        ];
    }
}
