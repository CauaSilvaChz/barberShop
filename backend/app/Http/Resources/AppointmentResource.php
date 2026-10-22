<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppointmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Data e hora já formatadas no horário de Sao Paulo, para o frontend
        // não precisar fazer conversão de timezone.
        return [
            'id' => $this->id,
            'service' => new ServiceResource($this->whenLoaded('service')),
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'date' => $this->start_at->format('Y-m-d'),
            'time' => $this->start_at->format('H:i'),
            'end_time' => $this->end_at->format('H:i'),
            'status' => $this->status,
            'can_cancel' => $this->canBeCancelledByCustomer(),
        ];
    }
}
