import axios from "axios";
import { clearAdminToken, getAdminToken } from "@/utils/auth";

/** Configuração central de comunicação com a API Laravel. */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
  headers: { Accept: "application/json" },
});

// Envia o token do barbeiro (se existir) em todas as requisições.
api.interceptors.request.use((config) => {
  const token = getAdminToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Token do barbeiro expirado/inválido: volta para a tela de login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAdminRequest = error.config?.url?.startsWith("/admin");

    if (error.response?.status === 401 && isAdminRequest) {
      clearAdminToken();
      // Fora de um componente React não há acesso ao router do Next, então recarregamos a página.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/admin/login";
    }

    return Promise.reject(error);
  },
);
