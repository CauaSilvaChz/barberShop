"use client";

import { FormEvent, useState } from "react";
import ErrorMessage from "@/components/ErrorMessage";
import { createService, updateService } from "@/services/adminService";
import type { Service } from "@/types";
import { getErrorMessage } from "@/utils/errors";

const DURATION_OPTIONS = [30, 60, 90, 120];

interface Props {
  service: Service | null; // null = novo serviço
  onSaved: (service: Service) => void;
  onCancel: () => void;
}

/** Formulário para criar ou editar um serviço. */
export default function ServiceForm({ service, onSaved, onCancel }: Props) {
  const [name, setName] = useState(service?.name ?? "");
  const [duration, setDuration] = useState(service?.duration_minutes ?? 30);
  const [active, setActive] = useState(service?.active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Informe o nome do serviço.");
      return;
    }

    setLoading(true);
    setError("");

    const payload = { name: name.trim(), duration_minutes: duration, active };

    try {
      const saved = service ? await updateService(service.id, payload) : await createService(payload);
      onSaved(saved);
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="text-lg font-bold">{service ? "Editar serviço" : "Novo serviço"}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="service-name" className="label">
            Nome
          </label>
          <input
            id="service-name"
            className="input"
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="service-duration" className="label">
            Duração
          </label>
          <select
            id="service-duration"
            className="input"
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
          >
            {DURATION_OPTIONS.map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes} minutos
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
        Ativo (visível para os clientes)
      </label>

      <ErrorMessage message={error} />

      <div className="flex gap-3">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
