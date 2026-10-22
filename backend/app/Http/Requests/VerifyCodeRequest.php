<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VerifyCodeRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge(['phone' => preg_replace('/\D/', '', (string) $this->phone)]);
    }

    public function rules(): array
    {
        return [
            'phone' => ['required', 'regex:/^\d{10,11}$/'],
            'code' => ['required', 'digits:6'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Informe um telefone válido com DDD.',
            'code.digits' => 'O código deve ter 6 números.',
        ];
    }
}
