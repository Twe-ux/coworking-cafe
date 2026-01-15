"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  Clock,
  UserPlus,
  FileText,
  CalendarCheck,
} from "lucide-react";
import Link from "next/link";
import { useEmployees } from "@/hooks/useEmployees";
import { useEffect, useState } from "react";

interface TimeEntriesStats {
  totalEntries: number;
  totalHours: number;
  activeShifts: number;
}

export default function HROverviewPage() {
  const { employees, isLoading: loadingEmployees } = useEmployees();
  const [timeStats, setTimeStats] = useState<TimeEntriesStats>({
    totalEntries: 0,
    totalHours: 0,
    activeShifts: 0,
  });
  const [loadingTimeStats, setLoadingTimeStats] = useState(true);

  // Fetch time entries stats for current month
  useEffect(() => {
    const fetchTimeStats = async () => {
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const response = await fetch(
          `/api/time-entries?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`
        );
        const result = await response.json();

        if (result.success && result.data) {
          const entries = result.data;
          const totalHours = entries.reduce(
            (sum: number, entry: any) => sum + (entry.totalHours || 0),
            0
          );
          const activeShifts = entries.filter(
            (entry: any) => entry.status === "active"
          ).length;

          setTimeStats({
            totalEntries: entries.length,
            totalHours: Math.round(totalHours * 10) / 10,
            activeShifts,
          });
        }
      } catch (error) {
        console.error("Error fetching time stats:", error);
      } finally {
        setLoadingTimeStats(false);
      }
    };

    fetchTimeStats();
  }, []);

  const activeEmployees = employees.filter((e) => e.isActive).length;
  const draftEmployees = employees.filter((e) => e.status === "draft").length;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion RH</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de la gestion des ressources humaines
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Employés Actifs
            </CardTitle>
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
            <CardTitle className="text-sm font-medium">
              Total Employés
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingEmployees ? "..." : employees.length}
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

      {/* Main Sections */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Employés */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Employés</CardTitle>
            </div>
            <CardDescription>
              Gérer les employés, onboarding, contrats et disponibilités
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full" variant="default">
              <Link href="/hr">
                <Users className="mr-2 h-4 w-4" />
                Voir tous les employés
              </Link>
            </Button>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/hr?tab=onboarding">Onboarding</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/hr?tab=contracts">Contrats</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="col-span-2"
              >
                <Link href="/hr?tab=availability">Disponibilités</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Planning */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Planning</CardTitle>
            </div>
            <CardDescription>
              Planifier et gérer les horaires de tous les employés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="default">
              <Link href="/schedule">
                <Calendar className="mr-2 h-4 w-4" />
                Gérer le planning
              </Link>
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              Créez et modifiez les créneaux horaires pour tous les employés
            </p>
          </CardContent>
        </Card>

        {/* Pointages */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Pointages</CardTitle>
            </div>
            <CardDescription>
              Récapitulatif des heures et pointages mensuels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="default">
              <Link href="/clocking/admin">
                <Clock className="mr-2 h-4 w-4" />
                Voir les pointages
              </Link>
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              Consultez et modifiez les entrées de temps des employés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>
            Accès direct aux fonctionnalités principales
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/hr?action=new">
              <UserPlus className="mr-2 h-4 w-4" />
              Nouvel employé
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/schedule">
              <Calendar className="mr-2 h-4 w-4" />
              Créer un créneau
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/clocking">
              <Clock className="mr-2 h-4 w-4" />
              Pointer un employé
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
