import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClockIcon, CheckCircle, XCircle, Inbox } from "lucide-react";
import type { BookingStatus } from "@/types/booking";

interface ReservationsStatsProps {
  stats: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
  };
  statusFilter: BookingStatus | "all";
  onFilterChange: (filter: BookingStatus | "all") => void;
}

export function ReservationsStats({
  stats,
  statusFilter,
  onFilterChange,
}: ReservationsStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "pending" ? "ring-2 ring-orange-500" : ""}`}
        onClick={() => onFilterChange("pending")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En attente</CardTitle>
          <ClockIcon className="w-4 h-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pending}</div>
        </CardContent>
      </Card>

      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "confirmed" ? "ring-2 ring-green-500" : ""}`}
        onClick={() => onFilterChange("confirmed")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Confirmées</CardTitle>
          <CheckCircle className="w-4 h-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.confirmed}</div>
        </CardContent>
      </Card>

      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "cancelled" ? "ring-2 ring-red-500" : ""}`}
        onClick={() => onFilterChange("cancelled")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Annulées</CardTitle>
          <XCircle className="w-4 h-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.cancelled}</div>
        </CardContent>
      </Card>

      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "all" ? "ring-2 ring-primary" : ""}`}
        onClick={() => onFilterChange("all")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <Inbox className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>
    </div>
  );
}
