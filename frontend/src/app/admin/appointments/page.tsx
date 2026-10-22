"use client";

import { useEffect, useState } from "react";
import AppointmentsTable from "@/components/admin/AppointmentsTable";
import ErrorMessage from "@/components/ErrorMessage";
import {
  AppointmentFilters,
  getAdminServices,
  getAppointments,
  updateAppointmentStatus,
} from "@/services/adminService";
import type { Appointment, Service } from "@/types";
import { STATUS_LABELS } from "@/utils/constants";
import { getErrorMessage } from "@/utils/errors";
import { todayInSaoPaulo } from "@/utils/format";

export default function AdminAppointmentsPage() {
  const [filters, setFilters] = useState<AppointmentFilters>({
    date: todayInSaoPaulo(),
    status: "",
    service_id: "",
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminServices().then(setServices).catch(() => {});
  }, []);

  useEffect(() => {
    getAppointments(filters)
      .then(setAppointments)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [filters]);

  function updateFilter(changes: Partial<AppointmentFilters>) {
    setLoading(true);
    setError("");
    setFilters((current) => ({ ...current, ...changes }));
  }

  async function changeStatus(appointment: Appointment, status: "completed" | "cancelled") {
    const action = status === "completed" ? "concluir" : "cancelar";
    if (!confirm(`Deseja ${action} o agendamento de ${appointment.customer_name} às ${appointment.time}?`)) return;

    setError("");

    try {
      const updated = await updateAppointmentStatus(appointment.id, status);
      setAppointments((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Agendamentos</h1>

      <div className="card grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="filter-date" className="label">
            Data
          </label>
          <input
            id="filter-date"
            type="date"
            className="input"
            value={filters.date}
            onChange={(event) => updateFilter({ date: event.target.value })}
          />
        </div>

        <div>
          <label htmlFor="filter-status" className="label">
            Status
          </label>
          <select
            id="filter-status"
            className="input"
            value={filters.status}
            onChange={(event) => updateFilter({ status: event.target.value as AppointmentFilters["status"] })}
          >
            <option value="">Todos</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-service" className="label">
            Serviço
          </label>
          <select
            id="filter-service"
            className="input"
            value={filters.service_id}
            onChange={(event) =>
              updateFilter({ service_id: event.target.value ? Number(event.target.value) : "" })
            }
          >
            <option value="">Todos</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ErrorMessage message={error} />

      <section className="card">
        {loading ? (
          <p className="text-stone-500">Carregando...</p>
        ) : (
          <AppointmentsTable
            appointments={appointments}
            onComplete={(appointment) => changeStatus(appointment, "completed")}
            onCancel={(appointment) => changeStatus(appointment, "cancelled")}
          />
        )}
      </section>
    </div>
  );
}
