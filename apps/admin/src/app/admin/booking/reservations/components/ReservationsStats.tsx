import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ClockIcon, CheckCircle, XCircle, Search, Calendar } from "lucide-react";
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
  nameFilter: string;
  setNameFilter: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
}

export function ReservationsStats({
  stats,
  statusFilter,
  onFilterChange,
  nameFilter,
  setNameFilter,
  dateFilter,
  setDateFilter,
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

      <Card className="transition-all">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Filtres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Name Filter */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              type="text"
              placeholder="Nom/Entreprise"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="h-8 pl-7 text-xs"
            />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-8 pl-7 text-xs"
            />
          </div>

          {/* Clear Filters */}
          {(nameFilter || dateFilter) && (
            <button
              type="button"
              onClick={() => {
                setNameFilter("");
                setDateFilter("");
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium w-full text-center pt-1"
            >
              Effacer
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
