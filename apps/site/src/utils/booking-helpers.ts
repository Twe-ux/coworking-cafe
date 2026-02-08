import type { Booking, SpaceConfig, StatusBadge } from "@/types/booking-confirmation";

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTime = (time: string): string => {
  return time;
};

export const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    desk: "Bureau",
    "meeting-room": "Salle de réunion",
    "meeting-room-glass": "Salle Verrière",
    "meeting-room-floor": "Salle Étage",
    "private-office": "Bureau privé",
    "event-space": "Espace événement",
    "open-space": "Open-space",
    "salle-verriere": "Salle Verrière",
    "salle-etage": "Salle Étage",
    evenementiel: "Événementiel",
  };
  return labels[type] || type;
};

export const getStatusBadge = (status: string): StatusBadge => {
  const badges: Record<string, StatusBadge> = {
    confirmed: { class: "bg-success", label: "Confirmé" },
    pending: { class: "bg-warning", label: "En attente" },
    cancelled: { class: "bg-danger", label: "Annulé" },
    completed: { class: "bg-info", label: "Terminé" },
  };
  return badges[status] || { class: "bg-secondary", label: status };
};

export const getPaymentStatusBadge = (status: string): StatusBadge => {
  const badges: Record<string, StatusBadge> = {
    paid: { class: "bg-success", label: "Payé" },
    pending: { class: "bg-warning", label: "En attente" },
    failed: { class: "bg-danger", label: "Échoué" },
    refunded: { class: "bg-info", label: "Remboursé" },
  };
  return badges[status] || { class: "bg-secondary", label: status };
};

export const calculateDepositAmount = (
  booking: Booking | null,
  spaceConfig: SpaceConfig | null
): number | null => {
  if (!booking || !spaceConfig?.depositPolicy?.enabled) {
    return null;
  }

  const totalPriceInCents = booking.totalPrice * 100;
  const policy = spaceConfig.depositPolicy;
  let depositInCents = totalPriceInCents;

  if (policy.fixedAmount) {
    depositInCents = policy.fixedAmount;
  } else if (policy.percentage) {
    depositInCents = Math.round(
      totalPriceInCents * (policy.percentage / 100)
    );
  }

  if (policy.minimumAmount && depositInCents < policy.minimumAmount) {
    depositInCents = policy.minimumAmount;
  }

  return depositInCents;
};
