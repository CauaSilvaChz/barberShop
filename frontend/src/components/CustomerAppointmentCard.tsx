import StatusBadge from "./StatusBadge";
import type { Appointment } from "@/types";
import { formatDate } from "@/utils/format";

interface Props {
  appointment: Appointment;
  onCancel: (appointment: Appointment) => void;
}

export default function CustomerAppointmentCard({ appointment, onCancel }: Props) {
  return (
    <li className="flex items-center justify-between gap-4 rounded-lg border border-stone-200 p-4">
      <div>
        <p className="font-semibold">{appointment.service.name}</p>
        <p className="text-sm text-stone-600">
          {formatDate(appointment.date)} às {appointment.time}
        </p>
        <div className="mt-1">
          <StatusBadge status={appointment.status} />
        </div>
      </div>

      {appointment.can_cancel && (
        <button type="button" className="btn btn-secondary text-red-700" onClick={() => onCancel(appointment)}>
          Cancelar
        </button>
      )}
    </li>
  );
}
