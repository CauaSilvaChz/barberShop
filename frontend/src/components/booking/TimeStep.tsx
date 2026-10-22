"use client";

import { useEffect, useState } from "react";
import ErrorMessage from "@/components/ErrorMessage";
import { getAvailability } from "@/services/customerService";
import type { Service, Slot } from "@/types";
import { getErrorMessage } from "@/utils/errors";

interface Props {
  service: Service;
  date: string;
  onSelect: (time: string) => void;
  onBack: () => void;
}

export default function TimeStep({ service, date, onSelect, onBack }: Props) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAvailability(date, service.id)
      .then(setSlots)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [date, service.id]);

  const hasAvailableSlot = slots.some((slot) => slot.available);

  return (
    <div className="space-y-4">
      {loading && <p className="text-stone-500">Carregando horários...</p>}
      <ErrorMessage message={error} />

      {!loading && !error && !hasAvailableSlot && (
        <p className="rounded-lg bg-stone-200 px-4 py-3 text-sm text-stone-700">
          Não há horários disponíveis nesta data. Escolha outro dia.
        </p>
      )}

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((slot) => (
          <button
            key={slot.time}
            type="button"
            disabled={!slot.available}
            onClick={() => onSelect(slot.time)}
            className={`rounded-lg border py-2.5 text-sm font-semibold transition ${
              slot.available
                ? "border-stone-300 bg-white hover:border-amber-600 hover:bg-amber-50"
                : "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 line-through opacity-60"
            }`}
          >
            {slot.time}
          </button>
        ))}
      </div>

      <button type="button" className="btn btn-secondary w-full" onClick={onBack}>
        Voltar
      </button>
    </div>
  );
}
