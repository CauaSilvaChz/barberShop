<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AvailabilityRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'service_id' => ['required', 'integer', Rule::exists('services', 'id')->where('active', true)],
        ];
    }

    public function messages(): array
    {
        return [
            'date.after_or_equal' => 'Não é possível agendar em uma data passada.',
        ];
    }
}
