"use client";

import { useEffect, useState } from "react";
import { getServices } from "@/services/customerService";
import type { Service } from "@/types";
import { getErrorMessage } from "@/utils/errors";

/** Carrega os serviços ativos (usado na página inicial e no agendamento). */
export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getServices()
      .then(setServices)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return { services, loading, error };
}
