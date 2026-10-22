import Link from "next/link";
import type { Appointment } from "@/types";
import { formatDate } from "@/utils/format";

export default function ConfirmationCard({ appointment }: { appointment: Appointment }) {
  const details = [
    { label: "Nome", value: appointment.customer_name },
    { label: "Serviço", value: appointment.service.name },
    { label: "Data", value: formatDate(appointment.date) },
    { label: "Horário", value: `${appointment.time} às ${appointment.end_time}` },
    { label: "Número do agendamento", value: `#${appointment.id}` },
  ];

  return (
    <div className="space-y-5 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
        ✓
      </div>
      <h2 className="text-2xl font-bold">Agendamento confirmado!</h2>

      <dl className="divide-y divide-stone-200 rounded-xl border border-stone-200 text-left">
        {details.map((item) => (
          <div key={item.label} className="flex justify-between gap-4 px-4 py-3 text-sm">
            <dt className="text-stone-500">{item.label}</dt>
            <dd className="font-semibold">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/meus-agendamentos" className="btn btn-secondary flex-1">
          Meus agendamentos
        </Link>
        <Link href="/" className="btn btn-primary flex-1">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
