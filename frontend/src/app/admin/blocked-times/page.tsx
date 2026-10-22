"use client";

import { useEffect, useState } from "react";
import BlockedTimeForm from "@/components/admin/BlockedTimeForm";
import ErrorMessage from "@/components/ErrorMessage";
import { deleteBlockedTime, getBlockedTimes } from "@/services/adminService";
import type { BlockedTime } from "@/types";
import { getErrorMessage } from "@/utils/errors";
import { formatDate } from "@/utils/format";

// Ordena por data e hora (os campos são textos "YYYY-MM-DD" e "HH:mm")
function sortByStart(list: BlockedTime[]): BlockedTime[] {
  return [...list].sort((a, b) => `${a.date} ${a.start_time}`.localeCompare(`${b.date} ${b.start_time}`));
}

export default function BlockedTimesPage() {
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getBlockedTimes()
      .then(setBlockedTimes)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(blockedTime: BlockedTime) {
    if (!confirm("Remover este bloqueio? O período voltará a ficar disponível para agendamento.")) return;

    setError("");

    try {
      await deleteBlockedTime(blockedTime.id);
      setBlockedTimes((current) => current.filter((item) => item.id !== blockedTime.id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bloqueio de horários</h1>
        <p className="text-sm text-stone-500">Períodos bloqueados não aparecem como disponíveis para os clientes.</p>
      </div>

      <BlockedTimeForm onCreated={(created) => setBlockedTimes((current) => sortByStart([...current, created]))} />

      <ErrorMessage message={error} />

      <section className="card">
        <h2 className="mb-4 text-lg font-bold">Bloqueios ativos</h2>

        {loading && <p className="text-stone-500">Carregando...</p>}
        {!loading && blockedTimes.length === 0 && <p className="text-stone-500">Nenhum bloqueio cadastrado.</p>}

        <ul className="divide-y divide-stone-100">
          {blockedTimes.map((blockedTime) => (
            <li key={blockedTime.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="font-semibold">
                  {formatDate(blockedTime.date)} · {blockedTime.start_time} às {blockedTime.end_time}
                </p>
                <p className="text-sm text-stone-500">{blockedTime.reason || "Sem motivo informado"}</p>
              </div>
              <button
                type="button"
                className="btn btn-secondary text-red-700"
                onClick={() => handleDelete(blockedTime)}
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
