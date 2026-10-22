<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBlockedTimeRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'reason' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'date.after_or_equal' => 'Não é possível bloquear uma data passada.',
            'end_time.after' => 'O horário final deve ser depois do horário inicial.',
        ];
    }
}
