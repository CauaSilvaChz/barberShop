"use client";

import { FormEvent, useState } from "react";
import ErrorMessage from "./ErrorMessage";
import { sendCode, verifyCode } from "@/services/customerService";
import { getErrorMessage } from "@/utils/errors";
import { formatPhone, onlyDigits } from "@/utils/format";

interface Props {
  phone: string;
  devCode?: string;
  onVerified: (token: string) => void | Promise<void>;
  onBack: () => void;
}

/**
 * Etapa de confirmação do código SMS.
 * Usada no agendamento e na consulta de "Meus agendamentos".
 */
export default function CodeVerification({ phone, devCode, onVerified, onBack }: Props) {
  const [code, setCode] = useState("");
  const [currentDevCode, setCurrentDevCode] = useState(devCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (code.length !== 6) {
      setError("O código deve ter 6 números.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { token } = await verifyCode(phone, code);
      await onVerified(token);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setInfo("");

    try {
      const response = await sendCode(phone);
      setCurrentDevCode(response.dev_code);
      setCode("");
      setInfo("Enviamos um novo código.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-stone-600">
        Enviamos um código de 6 números por SMS para <strong>{formatPhone(phone)}</strong>. Ele expira em 5 minutos.
      </p>

      {currentDevCode && (
        <p className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          <strong>Modo desenvolvimento:</strong> nenhum SMS foi enviado. Seu código é{" "}
          <strong className="tracking-widest">{currentDevCode}</strong>
        </p>
      )}

      <div>
        <label htmlFor="code" className="label">
          Código
        </label>
        <input
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          className="input text-center text-2xl tracking-[0.5em]"
          value={code}
          onChange={(event) => setCode(onlyDigits(event.target.value).slice(0, 6))}
        />
      </div>

      <ErrorMessage message={error} />
      {info && <p className="text-sm text-green-700">{info}</p>}

      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Confirmando..." : "Confirmar código"}
      </button>

      <div className="flex justify-between text-sm">
        <button type="button" className="text-stone-600 underline" onClick={onBack}>
          Voltar
        </button>
        <button type="button" className="text-amber-700 underline" onClick={handleResend}>
          Reenviar código
        </button>
      </div>
    </form>
  );
}
