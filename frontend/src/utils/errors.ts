import axios from "axios";

/**
 * Extrai uma mensagem amigável de um erro da API.
 * A API Laravel responde { message: "..." } e, em erros de validação,
 * { message, errors: { campo: ["..."] } }.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Não foi possível conectar ao servidor. Tente novamente.";
    }

    const data = error.response.data as { message?: string; errors?: Record<string, string[]> };
    const firstFieldError = data.errors ? Object.values(data.errors)[0]?.[0] : undefined;

    return firstFieldError ?? data.message ?? "Ocorreu um erro inesperado.";
  }

  return "Ocorreu um erro inesperado.";
}

export function isUnauthorized(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}
