"use client";

import { FormEvent, useState } from "react";
import ErrorMessage from "@/components/ErrorMessage";
import { todayInSaoPaulo } from "@/utils/format";

interface Props {
  initialDate: string;
  onNext: (date: string) => void;
  onBack: () => void;
}

export default function DateStep({ initialDate, onNext, onBack }: Props) {
  const today = todayInSaoPaulo();
  const [date, setDate] = useState(initialDate);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!date) {
      setError("Escolha uma data.");
      return;
    }

    // Datas no formato YYYY-MM-DD podem ser comparadas como texto
    if (date < today) {
      setError("Não é possível agendar em uma data passada.");
      return;
    }

    onNext(date);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="date" className="label">
          Data
        </label>
        <input
          id="date"
          type="date"
          className="input"
          min={today}
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>

      <ErrorMessage message={error} />

      <div className="flex gap-3">
        <button type="button" className="btn btn-secondary flex-1" onClick={onBack}>
          Voltar
        </button>
        <button type="submit" className="btn btn-primary flex-1">
          Ver horários
        </button>
      </div>
    </form>
  );
}
