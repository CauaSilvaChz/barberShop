import type { AppointmentStatus } from "@/types";
import { STATUS_LABELS } from "@/utils/constants";

const COLORS: Record<AppointmentStatus, string> = {
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-stone-200 text-stone-600",
};

export default function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
