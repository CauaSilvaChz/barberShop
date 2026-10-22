<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Pode ser executado mais de uma vez sem duplicar registros.
     */
    public function run(): void
    {
        // Usuário do barbeiro. Senha "password" APENAS para desenvolvimento.
        User::updateOrCreate(
            ['email' => 'admin@barbearia.com'],
            ['name' => 'Barbeiro', 'password' => 'password'],
        );

        $services = [
            ['name' => 'Corte', 'duration_minutes' => 30],
            ['name' => 'Corte e Barba', 'duration_minutes' => 30],
            ['name' => 'Luzes', 'duration_minutes' => 60],
        ];

        foreach ($services as $service) {
            Service::firstOrCreate(['name' => $service['name']], $service);
        }
    }
}
