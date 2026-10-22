"use client";

import { FormEvent, useState } from "react";
import ErrorMessage from "./ErrorMessage";
import { formatPhone, isValidPhone, onlyDigits } from "@/utils/format";

interface Props {
  submitLabel: string;
  loading: boolean;
  onSubmit: (phone: string) => void;
}

/** Formulário de telefone usado na página "Meus agendamentos". */
export default function PhoneForm({ submitLabel, loading, onSubmit }: Props) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!isValidPhone(phone)) {
      setError("Informe um telefone válido com DDD.");
      return;
    }

    setError("");
    onSubmit(onlyDigits(phone));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="phone" className="label">
          Telefone (com DDD)
        </label>
        <input
          id="phone"
          type="tel"
          inputMode="numeric"
          className="input"
          placeholder="(11) 99999-8888"
          value={phone}
          onChange={(event) => setPhone(formatPhone(event.target.value))}
        />
      </div>

      <ErrorMessage message={error} />

      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Enviando..." : submitLabel}
      </button>
    </form>
  );
}
