<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendCodeRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        // Salva o telefone só com números: "(11) 98888-7777" -> "11988887777"
        $this->merge(['phone' => preg_replace('/\D/', '', (string) $this->phone)]);
    }

    public function rules(): array
    {
        return [
            'phone' => ['required', 'regex:/^\d{10,11}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Informe um telefone válido com DDD.',
        ];
    }
}
