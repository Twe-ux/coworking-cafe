"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import TimeTrackingCard from "@/components/shared/TimeTrackingCard";
import type { Employee } from "@/types/hr";

/**
 * Card de pointage rapide pour la page d'accueil
 * Affiche un aperçu des employés et permet de pointer rapidement
 */
export function QuickClockingCard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/hr/employees?status=active");
      const result = await response.json();

      if (result.success) {
        // Afficher seulement les 4 premiers employés
        setEmployees((result.data || []).slice(0, 4));
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleStatusChange = () => {
    fetchEmployees();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle>Pointage</CardTitle>
        </div>
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            Voir tout
            <ExternalLink className="w-4 h-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">
            Chargement...
          </div>
        ) : employees.length > 0 ? (
          <div className="grid gap-3">
            {employees.map((employee) => (
              <TimeTrackingCard
                key={employee.id}
                employee={employee}
                onStatusChange={handleStatusChange}
                className="shadow-sm"
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Aucun employé actif
          </div>
        )}
      </CardContent>
    </Card>
  );
}
