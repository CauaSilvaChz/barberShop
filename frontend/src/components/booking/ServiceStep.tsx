"use client";

import ErrorMessage from "@/components/ErrorMessage";
import { useServices } from "@/hooks/useServices";
import type { Service } from "@/types";

interface Props {
  selectedId?: number;
  onSelect: (service: Service) => void;
}

export default function ServiceStep({ selectedId, onSelect }: Props) {
  const { services, loading, error } = useServices();

  if (loading) return <p className="text-stone-500">Carregando serviços...</p>;

  return (
    <div className="space-y-3">
      <ErrorMessage message={error} />

      {services.map((service) => (
        <button
          key={service.id}
          type="button"
          onClick={() => onSelect(service)}
          className={`flex w-full items-center justify-between rounded-xl border bg-white p-4 text-left transition hover:border-amber-600 ${
            service.id === selectedId ? "border-amber-600 ring-2 ring-amber-200" : "border-stone-200"
          }`}
        >
          <span className="font-semibold">{service.name}</span>
          <span className="text-sm text-stone-500">{service.duration_minutes} min</span>
        </button>
      ))}
    </div>
  );
}
