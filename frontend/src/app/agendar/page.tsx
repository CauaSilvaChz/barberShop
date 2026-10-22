"use client";

import { useState } from "react";
import CodeVerification from "@/components/CodeVerification";
import ErrorMessage from "@/components/ErrorMessage";
import SiteHeader from "@/components/SiteHeader";
import ConfirmationCard from "@/components/booking/ConfirmationCard";
import CustomerStep from "@/components/booking/CustomerStep";
import DateStep from "@/components/booking/DateStep";
import ServiceStep from "@/components/booking/ServiceStep";
import TimeStep from "@/components/booking/TimeStep";
import { createAppointment, sendCode } from "@/services/customerService";
import type { Appointment, Service } from "@/types";
import { getErrorMessage, isUnauthorized } from "@/utils/errors";
import { formatDate } from "@/utils/format";

type Step = "service" | "date" | "time" | "customer" | "code" | "done";

const STEP_TITLES: Record<Step, string> = {
  service: "Escolha o serviço",
  date: "Escolha a data",
  time: "Escolha o horário",
  customer: "Seus dados",
  code: "Confirme seu telefone",
  done: "",
};

const STEP_ORDER: Step[] = ["service", "date", "time", "customer", "code"];

export default function BookingPage() {
  const [step, setStep] = useState<Step>("service");
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [devCode, setDevCode] = useState<string>();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Token do telefone já confirmado. Se o horário for tomado por outra pessoa,
  // o cliente escolhe outro horário sem precisar receber um novo SMS.
  const [token, setToken] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");

  function goTo(nextStep: Step) {
    setError("");
    setStep(nextStep);
  }

  function goBack() {
    goTo(STEP_ORDER[STEP_ORDER.indexOf(step) - 1] ?? "service");
  }

  async function book(customerToken: string, customerName: string) {
    try {
      const created = await createAppointment(customerToken, {
        service_id: service!.id,
        date,
        time,
        customer_name: customerName,
      });
      setAppointment(created);
      goTo("done");
    } catch (err) {
      if (isUnauthorized(err)) {
        // O token do telefone expirou (30 min): pede um novo código.
        setToken("");
        setStep("customer");
      } else {
        // Normalmente: o horário foi ocupado por outra pessoa. Volta para escolher outro.
        setTime("");
        setStep("time");
      }
      setError(getErrorMessage(err));
    }
  }

  async function handleCustomerSubmit(customerName: string, customerPhone: string) {
    setName(customerName);
    setPhone(customerPhone);
    setError("");
    setLoading(true);

    try {
      if (token && verifiedPhone === customerPhone) {
        await book(token, customerName);
        return;
      }

      const response = await sendCode(customerPhone);
      setDevCode(response.dev_code);
      goTo("code");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerified(newToken: string) {
    setToken(newToken);
    setVerifiedPhone(phone);
    await book(newToken, name);
  }

  const stepNumber = STEP_ORDER.indexOf(step) + 1;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
        {step !== "done" && (
          <div className="mb-6">
            <p className="text-sm font-medium text-amber-700">
              Etapa {stepNumber} de {STEP_ORDER.length}
            </p>
            <h1 className="text-2xl font-bold">{STEP_TITLES[step]}</h1>

            {service && step !== "service" && (
              <p className="mt-2 text-sm text-stone-600">
                {service.name}
                {date && step !== "date" && ` · ${formatDate(date)}`}
                {time && (step === "customer" || step === "code") && ` · ${time}`}
              </p>
            )}
          </div>
        )}

        <div className="card space-y-4">
          <ErrorMessage message={error} />

          {step === "service" && (
            <ServiceStep
              selectedId={service?.id}
              onSelect={(selected) => {
                setService(selected);
                setTime("");
                goTo("date");
              }}
            />
          )}

          {step === "date" && (
            <DateStep
              initialDate={date}
              onBack={goBack}
              onNext={(selectedDate) => {
                setDate(selectedDate);
                setTime("");
                goTo("time");
              }}
            />
          )}

          {step === "time" && service && (
            <TimeStep
              service={service}
              date={date}
              onBack={goBack}
              onSelect={(selectedTime) => {
                setTime(selectedTime);
                goTo("customer");
              }}
            />
          )}

          {step === "customer" && (
            <CustomerStep
              initialName={name}
              initialPhone={phone}
              loading={loading}
              onBack={goBack}
              onSubmit={handleCustomerSubmit}
            />
          )}

          {step === "code" && (
            <CodeVerification phone={phone} devCode={devCode} onBack={goBack} onVerified={handleVerified} />
          )}

          {step === "done" && appointment && <ConfirmationCard appointment={appointment} />}
        </div>
      </main>
    </>
  );
}
