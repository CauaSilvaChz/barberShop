import { api } from "./api";
import type { AdminUser, Appointment, AppointmentStatus, BlockedTime, Service } from "@/types";

export async function login(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
  const { data } = await api.post("/login", { email, password });
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/logout");
}

// Agendamentos

export interface AppointmentFilters {
  date?: string;
  status?: AppointmentStatus | "";
  service_id?: number | "";
  upcoming?: boolean;
}

export async function getAppointments(filters: AppointmentFilters = {}): Promise<Appointment[]> {
  // Remove filtros vazios da query string
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value !== undefined),
  );
  if (params.upcoming) params.upcoming = 1;

  const { data } = await api.get<Appointment[]>("/admin/appointments", { params });
  return data;
}

export async function updateAppointmentStatus(
  id: number,
  status: Exclude<AppointmentStatus, "confirmed">,
): Promise<Appointment> {
  const { data } = await api.patch<Appointment>(`/admin/appointments/${id}/status`, { status });
  return data;
}

// Serviços

export interface ServicePayload {
  name: string;
  duration_minutes: number;
  active: boolean;
}

export async function getAdminServices(): Promise<Service[]> {
  const { data } = await api.get<Service[]>("/admin/services");
  return data;
}

export async function createService(payload: ServicePayload): Promise<Service> {
  const { data } = await api.post<Service>("/admin/services", payload);
  return data;
}

export async function updateService(id: number, payload: ServicePayload): Promise<Service> {
  const { data } = await api.put<Service>(`/admin/services/${id}`, payload);
  return data;
}

export async function updateServiceStatus(id: number, active: boolean): Promise<Service> {
  const { data } = await api.patch<Service>(`/admin/services/${id}/status`, { active });
  return data;
}

// Bloqueios

export interface BlockedTimePayload {
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
}

export async function getBlockedTimes(): Promise<BlockedTime[]> {
  const { data } = await api.get<BlockedTime[]>("/admin/blocked-times");
  return data;
}

export async function createBlockedTime(payload: BlockedTimePayload): Promise<BlockedTime> {
  const { data } = await api.post<BlockedTime>("/admin/blocked-times", payload);
  return data;
}

export async function deleteBlockedTime(id: number): Promise<void> {
  await api.delete(`/admin/blocked-times/${id}`);
}
