"use client";

import Link from "next/link";
import ErrorMessage from "@/components/ErrorMessage";
import { useServices } from "@/hooks/useServices";
import { BUSINESS_HOURS, SHOP_NAME } from "@/utils/constants";

export default function HomePage() {
  const { services, loading, error } = useServices();

  return (
    <main className="flex-1">
      <section className="bg-stone-900 px-4 py-16 text-center text-white">
        <p className="text-4xl">✂</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{SHOP_NAME}</h1>
        <p className="mt-2 text-stone-300">Corte, barba e luzes. Agende em poucos cliques.</p>

        <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:flex-row">
          <Link href="/agendar" className="btn btn-primary flex-1 py-3 text-base">
            Agendar
          </Link>
          <Link href="/meus-agendamentos" className="btn btn-secondary flex-1 py-3 text-base">
            Meus agendamentos
          </Link>
        </div>
      </section>

      <div className="mx-auto grid max-w-3xl gap-6 px-4 py-10 md:grid-cols-2">
        <section className="card">
          <h2 className="mb-4 text-lg font-bold">Serviços</h2>
          {loading && <p className="text-stone-500">Carregando...</p>}
          <ErrorMessage message={error} />
          <ul className="divide-y divide-stone-100">
            {services.map((service) => (
              <li key={service.id} className="flex justify-between py-2.5">
                <span>{service.name}</span>
                <span className="text-sm text-stone-500">{service.duration_minutes} min</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2 className="mb-4 text-lg font-bold">Horário de funcionamento</h2>
          <p className="text-stone-700">{BUSINESS_HOURS}</p>
          <p className="mt-2 text-sm text-stone-500">Atendimento com hora marcada, em horários de 30 em 30 minutos.</p>
        </section>
      </div>

      <footer className="pb-8 text-center text-xs text-stone-400">
        <Link href="/admin" className="hover:underline">
          Área do barbeiro
        </Link>
      </footer>
    </main>
  );
}
