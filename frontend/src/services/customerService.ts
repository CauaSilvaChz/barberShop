import { api } from "./api";
import type { Appointment, Service, Slot } from "@/types";

// Header com o token recebido após confirmar o código SMS.
function customerHeaders(token: string) {
  return { headers: { "X-Customer-Token": token } };
}

export async function getServices(): Promise<Service[]> {
  const { data } = await api.get<Service[]>("/services");
  return data;
}

export async function getAvailability(date: string, serviceId: number): Promise<Slot[]> {
  const { data } = await api.get<{ slots: Slot[] }>("/availability", {
    params: { date, service_id: serviceId },
  });
  return data.slots;
}

export async function sendCode(phone: string): Promise<{ message: string; dev_code?: string }> {
  const { data } = await api.post("/verification/send", { phone });
  return data;
}

export async function verifyCode(phone: string, code: string): Promise<{ token: string; phone: string }> {
  const { data } = await api.post("/verification/verify", { phone, code });
  return data;
}

export interface NewAppointment {
  service_id: number;
  date: string;
  time: string;
  customer_name: string;
}

export async function createAppointment(token: string, appointment: NewAppointment): Promise<Appointment> {
  const { data } = await api.post<Appointment>("/appointments", appointment, customerHeaders(token));
  return data;
}

export async function getMyAppointments(token: string): Promise<Appointment[]> {
  const { data } = await api.get<Appointment[]>("/my-appointments", customerHeaders(token));
  return data;
}

export async function cancelAppointment(token: string, id: number): Promise<Appointment> {
  const { data } = await api.patch<Appointment>(`/appointments/${id}/cancel`, {}, customerHeaders(token));
  return data;
}
