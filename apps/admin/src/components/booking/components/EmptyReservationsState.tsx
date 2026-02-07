import { Users } from "lucide-react";

interface EmptyReservationsStateProps {
  variant: "admin" | "staff";
  isAdminOrDev: boolean;
}

export function EmptyReservationsState({
  variant,
  isAdminOrDev,
}: EmptyReservationsStateProps) {
  const getMessage = () => {
    if (variant === "staff" && isAdminOrDev) {
      return "Aucune réservation aujourd'hui";
    }
    if (variant === "staff") {
      return "Aucune réservation confirmée aujourd'hui";
    }
    return "Aucune réservation validée aujourd'hui";
  };

  return (
    <div className="flex h-[200px] flex-col items-center justify-center text-muted-foreground">
      <Users className="h-12 w-12 mb-3 opacity-50" />
      <p className="text-sm">{getMessage()}</p>
    </div>
  );
}
