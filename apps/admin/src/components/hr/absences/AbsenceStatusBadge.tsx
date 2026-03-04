import { Badge } from "@/components/ui/badge";
import type { AbsenceStatus } from "@/types/absence";

interface AbsenceStatusBadgeProps {
  status: AbsenceStatus;
}

export function AbsenceStatusBadge({ status }: AbsenceStatusBadgeProps) {
  const config = {
    pending: {
      label: "En attente",
      variant: "secondary" as const,
      className: "bg-yellow-100 text-yellow-800",
    },
    approved: {
      label: "Approuvée",
      variant: "default" as const,
      className: "bg-green-100 text-green-800",
    },
    rejected: {
      label: "Refusée",
      variant: "destructive" as const,
      className: "bg-red-100 text-red-800",
    },
  };

  const { label, className } = config[status];

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
