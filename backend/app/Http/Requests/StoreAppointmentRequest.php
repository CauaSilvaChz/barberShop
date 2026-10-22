<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAppointmentRequest extends FormRequest
{
    public function rules(): array
    {
        // O telefone não vem no corpo: ele é lio do token de telefone confirmad
        return [
            'service_id' => ['required', 'integer', Rule::exists('services', 'id')->where('active', true)],
            'date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'time' => ['required', 'date_format:H:i'],
            'customer_name' => ['required', 'string', 'min:2', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'date.after_or_equal' => 'Não é possível agendar em uma data passada.',
        ];
    }
}
