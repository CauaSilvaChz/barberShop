<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            // restrictOnDelete: um serviço já usado em agendamentos não pode ser excluído.
            $table->foreignId('service_id')->constrained()->restrictOnDelete();
            $table->string('customer_name', 100);
            $table->string('customer_phone', 20)->index();
            $table->dateTime('start_at');
            $table->dateTime('end_at');
            $table->string('status', 20)->default('confirmed');
            $table->timestamps();

            // Garantia extra no banco: dois agendamentos confirmados não podem começar no mesmo horário.
            // Coluna calculada pelo próprio banco: tem o valor de start_at quando o status é "confirmed"
            // e fica NULL nos outros casos. O índice único ignora NULL, então cancelados não bloqueiam o horário.
            $table->dateTime('confirmed_start_at')
                ->nullable()
                ->storedAs("CASE WHEN status = 'confirmed' THEN start_at END")
                ->unique();

            $table->index(['start_at', 'end_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
