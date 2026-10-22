# ✂ Barbearia — Sistema de Agendamento

Sistema de agendamento online para uma barbearia, com uma área para o cliente e outra para o barbeiro.

**Cliente** (sem precisar criar conta):
- escolhe o serviço, a data e um horário livre
- confirma o telfone com um código enviado por SMS
- consulta e cancela os próprios agendamentos

**Barbeiro** (área protegida por login):
- dashboard com os agendamentos do dia
- lista de agendamentos com filtros, para marcar como concluído ou cancelar
- bloqueio de horários (ex.: almoço)
- cadastro de serviços

A barbearia funciona das 08:00 às 20:00, com horários de 30 em 30 minutos. Serviços de 1 hora ocupam dois horários, e o backend impede agendamentos em horários ocupados, bloqueados, passados ou fora do expediente.

## Tecnologias

- **Backend:** PHP, Laravel 12 (API REST), Eloquent, Laravel Sanctum, PHPUnit
- **Frontend:** Next.js 16, React, TypeScript, Tailwind CSS, Axios
- **Banco de dados:** MariaDB
- **SMS:** Twilio

```
Next.js (porta 3000)  →  Laravel API (porta 8000)  →  MariaDB (porta 3306)
```

## Como rodar na sua máquina

### Requisitos

- PHP 8.2+ e Composer
- Node.js 20+
- MariaDB (ou o [XAMPP](https://www.apachefriends.org), que já inclui PHP e MariaDB)

### 1. Clonar o projeto

```bash
git clone <url-deste-repositorio>
cd barberShop
```

### 2 Criar o banco de dados

Com o MariaDB rodando, crie o banco (no XAMPP, pelo phpMyAdmin em http://localhost/phpmyadmin):

```sql
CREATE DATABASE barbearia_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Rodar o backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

> No Windows, use `copy` no lugar de `cp`.
> O `.env` já vem configurao para o MariaDB padrão do XAMPP (usuário `root`, sem senha). Se o seu for diferente, ajuste as variáveis `DB_*`.

A API fica disponível em http://localhost:8000.

### 4. Rodar o frontend

Em **outro terminal**:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Acesse http://localhost:3000.

## Testando o sistema

- **Como cliente:** em http://localhost:3000, clique em **Agendar**. Use qualquer telefone com DDD. Nenhum SMS de verdade é enviado: o código de 6 dígitos aparece na própria tela, num aviso amarelo de **modo desenvolvimento**.
- **Como barbeiro:** acesse http://localhost:3000/admin com:
  - e-mail: `admin@barbearia.com`
  - senha: `password`

> Essa senha e o modo desenvolvimento do SMS servem apenas para testes locais.

Para rodar os testes automatizados do backend (não precisam do MariaDB):

```bash
cd backend
php artisan test
```

## SMS real (opcional)

Para enviar SMS de verdade pelo Twilio, preencha no `backend/.env`:

```env
SMS_DEV_MODE=false
TWILIO_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_FROM=+15551234567
```
