"use client";

import { FormEvent, useState } from "react";
import ErrorMessage from "@/components/ErrorMessage";
import { formatPhone, isValidPhone, onlyDigits } from "@/utils/format";

interface Props {
  initialName: string;
  initialPhone: string;
  loading: boolean;
  onSubmit: (name: string, phone: string) => void;
  onBack: () => void;
}

export default function CustomerStep({ initialName, initialPhone, loading, onSubmit, onBack }: Props) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(formatPhone(initialPhone));
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (name.trim().length < 2) {
      setError("Informe seu nome.");
      return;
    }

    if (!isValidPhone(phone)) {
      setError("Informe um telefone válido com DDD.");
      return;
    }

    setError("");
    onSubmit(name.trim(), onlyDigits(phone));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="label">
          Nome
        </label>
        <input
          id="name"
          className="input"
          maxLength={100}
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="phone" className="label">
          Telefone (com DDD)
        </label>
        <input
          id="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          className="input"
          placeholder="(11) 99999-8888"
          value={phone}
          onChange={(event) => setPhone(formatPhone(event.target.value))}
        />
        <p className="mt-1 text-xs text-stone-500">Vamos enviar um código por SMS para confirmar.</p>
      </div>

      <ErrorMessage message={error} />

      <div className="flex gap-3">
        <button type="button" className="btn btn-secondary flex-1" onClick={onBack}>
          Voltar
        </button>
        <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
          {loading ? "Enviando..." : "Continuar"}
        </button>
      </div>
    </form>
  );
}
