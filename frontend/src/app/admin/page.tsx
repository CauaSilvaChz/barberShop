"use client";

import { useEffect, useState } from "react";
import ErrorMessage from "@/components/ErrorMessage";
import StatusBadge from "@/components/StatusBadge";
import { getAppointments } from "@/services/adminService";
import type { Appointment, AppointmentStatus } from "@/types";
import { getErrorMessage } from "@/utils/errors";
import { formatDate, formatPhone, todayInSaoPaulo } from "@/utils/format";

export default function DashboardPage() {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getAppointments({ date: todayInSaoPaulo() }), getAppointments({ upcoming: true })])
      .then(([todayList, upcomingList]) => {
        setTodayAppointments(todayList);
        setUpcoming(upcomingList);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const countByStatus = (status: AppointmentStatus) =>
    todayAppointments.filter((appointment) => appointment.status === status).length;

  const stats = [
    { label: "Agendamentos hoje", value: todayAppointments.length },
    { label: "Confirmados", value: countByStatus("confirmed") },
    { label: "Concluídos", value: countByStatus("completed") },
    { label: "Cancelados", value: countByStatus("cancelled") },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-stone-500">Hoje, {formatDate(todayInSaoPaulo())}</p>
      </div>

      <ErrorMessage message={error} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <p className="text-sm text-stone-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold">{loading ? "–" : stat.value}</p>
          </div>
        ))}
      </div>

      <section className="card">
        <h2 className="mb-4 text-lg font-bold">Próximos agendamentos</h2>

        {!loading && upcoming.length === 0 && <p className="text-stone-500">Nenhum agendamento futuro.</p>}

        <ul className="divide-y divide-stone-100">
          {upcoming.map((appointment) => (
            <li key={appointment.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="font-semibold">
                  {formatDate(appointment.date)} · {appointment.time}
                </p>
                <p className="text-sm text-stone-600">
                  {appointment.customer_name} · {formatPhone(appointment.customer_phone)} · {appointment.service.name}
                </p>
              </div>
              <StatusBadge status={appointment.status} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
