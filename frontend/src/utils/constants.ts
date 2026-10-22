import type { AppointmentStatus } from "@/types";

export const SHOP_NAME = "Barbearia do Zé";

export const BUSINESS_HOURS = "Das 08:00 às 20:00";

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
};
