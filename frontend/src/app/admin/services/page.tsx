"use client";

import { useEffect, useState } from "react";
import ServiceForm from "@/components/admin/ServiceForm";
import ErrorMessage from "@/components/ErrorMessage";
import { getAdminServices, updateServiceStatus } from "@/services/adminService";
import type { Service } from "@/types";
import { getErrorMessage } from "@/utils/errors";

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // null = formulário fechado; "new" = novo serviço; Service = editando
  const [editing, setEditing] = useState<Service | "new" | null>(null);

  useEffect(() => {
    getAdminServices()
      .then(setServices)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  function handleSaved(saved: Service) {
    setServices((current) =>
      current.some((item) => item.id === saved.id)
        ? current.map((item) => (item.id === saved.id ? saved : item))
        : [...current, saved],
    );
    setEditing(null);
  }

  async function toggleActive(service: Service) {
    setError("");

    try {
      const updated = await updateServiceStatus(service.id, !service.active);
      handleSaved(updated);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Serviços</h1>
          <p className="text-sm text-stone-500">
            Serviços já usados em agendamentos não são excluídos, apenas desativados.
          </p>
        </div>
        {editing === null && (
          <button type="button" className="btn btn-primary" onClick={() => setEditing("new")}>
            Adicionar serviço
          </button>
        )}
      </div>

      {editing !== null && (
        <ServiceForm
          key={editing === "new" ? "new" : editing.id}
          service={editing === "new" ? null : editing}
          onSaved={handleSaved}
          onCancel={() => setEditing(null)}
        />
      )}

      <ErrorMessage message={error} />

      <section className="card">
        {loading && <p className="text-stone-500">Carregando...</p>}

        <ul className="divide-y divide-stone-100">
          {services.map((service) => (
            <li key={service.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className={`font-semibold ${service.active ? "" : "text-stone-400 line-through"}`}>
                  {service.name}
                </p>
                <p className="text-sm text-stone-500">
                  {service.duration_minutes} min · {service.active ? "Ativo" : "Inativo"}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(service)}>
                  Editar
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => toggleActive(service)}>
                  {service.active ? "Desativar" : "Ativar"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
