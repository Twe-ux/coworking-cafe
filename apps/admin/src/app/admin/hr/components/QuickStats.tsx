import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarCheck, Clock, UserPlus, Users } from "lucide-react";

interface TimeEntriesStats {
  totalEntries: number;
  totalHours: number;
  activeShifts: number;
}

interface QuickStatsProps {
  loadingEmployees: boolean;
  activeEmployees: number;
  draftEmployees: number;
  totalEmployees: number;
  loadingTimeStats: boolean;
  timeStats: TimeEntriesStats;
}

export function QuickStats({
  loadingEmployees,
  activeEmployees,
  draftEmployees,
  totalEmployees,
  loadingTimeStats,
  timeStats,
}: QuickStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Employés Actifs</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loadingEmployees ? "..." : activeEmployees}
          </div>
          <p className="text-xs text-muted-foreground">
            {draftEmployees > 0 && `${draftEmployees} en attente`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Employés</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loadingEmployees ? "..." : totalEmployees}
          </div>
          <p className="text-xs text-muted-foreground">
            Tous statuts confondus
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pointages ce mois
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loadingTimeStats ? "..." : timeStats.totalEntries}
          </div>
          <p className="text-xs text-muted-foreground">
            {timeStats.activeShifts} shifts actifs
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Heures travaillées
          </CardTitle>
          <CalendarCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loadingTimeStats ? "..." : `${timeStats.totalHours}h`}
          </div>
          <p className="text-xs text-muted-foreground">Ce mois-ci</p>
        </CardContent>
      </Card>
    </div>
  );
}
