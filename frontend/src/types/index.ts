export type AppointmentStatus = "confirmed" | "completed" | "cancelled";

export interface Service {
  id: number;
  name: string;
  duration_minutes: number;
  active: boolean;
}

export interface Slot {
  time: string; // "HH:mm"
  available: boolean;
}

export interface Appointment {
  id: number;
  service: Service;
  customer_name: string;
  customer_phone: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  end_time: string;
  status: AppointmentStatus;
  can_cancel: boolean;
}

export interface BlockedTime {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
}
