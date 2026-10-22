"use client";

import { useState } from "react";
import CodeVerification from "@/components/CodeVerification";
import ErrorMessage from "@/components/ErrorMessage";
import PhoneForm from "@/components/PhoneForm";
import SiteHeader from "@/components/SiteHeader";
import CustomerAppointmentCard from "@/components/CustomerAppointmentCard";
import { cancelAppointment, getMyAppointments, sendCode } from "@/services/customerService";
import type { Appointment } from "@/types";
import { getErrorMessage, isUnauthorized } from "@/utils/errors";

type Step = "phone" | "code" | "list";

export default function MyAppointmentsPage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [devCode, setDevCode] = useState<string>();
  const [token, setToken] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePhoneSubmit(phoneNumber: string) {
    setLoading(true);
    setError("");

    try {
      const response = await sendCode(phoneNumber);
      setPhone(phoneNumber);
      setDevCode(response.dev_code);
      setStep("code");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerified(newToken: string) {
    const list = await getMyAppointments(newToken);
    setToken(newToken);
    setAppointments(list);
    setStep("list");
  }

  async function handleCancel(appointment: Appointment) {
    if (!confirm(`Cancelar o agendamento de ${appointment.service.name} às ${appointment.time}?`)) return;

    setError("");

    try {
      const updated = await cancelAppointment(token, appointment.id);
      setAppointments((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(getErrorMessage(err));

      // O token de telefone expira em 30 minutos: pede a confirmação novamente.
      if (isUnauthorized(err)) {
        setToken("");
        setStep("phone");
      }
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Meus agendamentos</h1>

        <div className="card space-y-4">
          <ErrorMessage message={error} />

          {step === "phone" && (
            <>
              <p className="text-sm text-stone-600">
                Informe o telefone usado no agendamento. Vamos enviar um código por SMS para confirmar que o número é
                seu.
              </p>
              <PhoneForm submitLabel="Enviar código" loading={loading} onSubmit={handlePhoneSubmit} />
            </>
          )}

          {step === "code" && (
            <CodeVerification
              phone={phone}
              devCode={devCode}
              onVerified={handleVerified}
              onBack={() => setStep("phone")}
            />
          )}

          {step === "list" && (
            <>
              {appointments.length === 0 && (
                <p className="text-stone-600">Nenhum agendamento encontrado para este telefone.</p>
              )}

              <ul className="space-y-3">
                {appointments.map((appointment) => (
                  <CustomerAppointmentCard key={appointment.id} appointment={appointment} onCancel={handleCancel} />
                ))}
              </ul>
            </>
          )}
        </div>
      </main>
    </>
  );
}
