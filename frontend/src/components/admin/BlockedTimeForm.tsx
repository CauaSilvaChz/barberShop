"use client";

import { FormEvent, useState } from "react";
import ErrorMessage from "@/components/ErrorMessage";
import { createBlockedTime } from "@/services/adminService";
import type { BlockedTime } from "@/types";
import { getErrorMessage } from "@/utils/errors";
import { todayInSaoPaulo } from "@/utils/format";

const EMPTY_FORM = { date: "", start_time: "", end_time: "", reason: "" };

export default function BlockedTimeForm({ onCreated }: { onCreated: (blockedTime: BlockedTime) => void }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!form.date || !form.start_time || !form.end_time) {
      setError("Preencha a data e os horários.");
      return;
    }

    if (form.end_time <= form.start_time) {
      setError("O horário final deve ser depois do horário inicial.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const created = await createBlockedTime(form);
      onCreated(created);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="text-lg font-bold">Novo bloqueio</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="block-date" className="label">
            Data
          </label>
          <input
            id="block-date"
            type="date"
            className="input"
            min={todayInSaoPaulo()}
            value={form.date}
            onChange={(event) => updateField("date", event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="block-start" className="label">
            Horário inicial
          </label>
          <input
            id="block-start"
            type="time"
            step={1800}
            className="input"
            value={form.start_time}
            onChange={(event) => updateField("start_time", event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="block-end" className="label">
            Horário final
          </label>
          <input
            id="block-end"
            type="time"
            step={1800}
            className="input"
            value={form.end_time}
            onChange={(event) => updateField("end_time", event.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="block-reason" className="label">
          Motivo (opcional)
        </label>
        <input
          id="block-reason"
          className="input"
          maxLength={255}
          placeholder="Ex.: Almoço"
          value={form.reason}
          onChange={(event) => updateField("reason", event.target.value)}
        />
      </div>

      <ErrorMessage message={error} />

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Salvando..." : "Bloquear período"}
      </button>
    </form>
  );
}
