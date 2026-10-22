import StatusBadge from "@/components/StatusBadge";
import type { Appointment } from "@/types";
import { formatDate, formatPhone } from "@/utils/format";

interface Props {
  appointments: Appointment[];
  onComplete: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
}

export default function AppointmentsTable({ appointments, onComplete, onCancel }: Props) {
  if (appointments.length === 0) {
    return <p className="text-stone-500">Nenhum agendamento encontrado.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-stone-200 text-stone-500">
          <tr>
            <th className="py-2 pr-4 font-medium">Horário</th>
            <th className="py-2 pr-4 font-medium">Cliente</th>
            <th className="py-2 pr-4 font-medium">Telefone</th>
            <th className="py-2 pr-4 font-medium">Serviço</th>
            <th className="py-2 pr-4 font-medium">Duração</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {appointments.map((appointment) => (
            <tr key={appointment.id}>
              <td className="py-3 pr-4">
                <p className="font-semibold">
                  {appointment.time} – {appointment.end_time}
                </p>
                <p className="text-xs text-stone-500">{formatDate(appointment.date)}</p>
              </td>
              <td className="py-3 pr-4">{appointment.customer_name}</td>
              <td className="py-3 pr-4 whitespace-nowrap">{formatPhone(appointment.customer_phone)}</td>
              <td className="py-3 pr-4">{appointment.service.name}</td>
              <td className="py-3 pr-4">{appointment.service.duration_minutes} min</td>
              <td className="py-3 pr-4">
                <StatusBadge status={appointment.status} />
              </td>
              <td className="py-3">
                {appointment.status === "confirmed" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-primary px-3 py-1.5"
                      onClick={() => onComplete(appointment)}
                    >
                      Concluir
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary px-3 py-1.5 text-red-700"
                      onClick={() => onCancel(appointment)}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
