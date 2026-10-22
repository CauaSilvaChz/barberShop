export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** "11999998888" -> "(11) 99999-8888" (também formata enquanto o usuário digita) */
export function formatPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function isValidPhone(value: string): boolean {
  const length = onlyDigits(value).length;
  return length === 10 || length === 11;
}

/** "2026-10-02" -> "02/10/2026" (sem usar Date, para evitar problemas de timezone) */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

/** Data de hoje no fuso da barbearia, no formato "YYYY-MM-DD". */
export function todayInSaoPaulo(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}
