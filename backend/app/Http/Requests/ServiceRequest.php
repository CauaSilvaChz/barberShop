<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Usado para criar e editar serviços.
 */
class ServiceRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            // A agenda trabalha com blocos de 30 minutos.
            'duration_minutes' => ['required', 'integer', 'min:30', 'max:240', 'multiple_of:30'],
            'active' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'duration_minutes.multiple_of' => 'A duração deve ser múltipla de 30 minutos.',
        ];
    }
}
