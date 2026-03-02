"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import TimeEntriesList from "@/components/clocking/TimeEntriesList";
import { ClockingAdminPageSkeleton } from "./ClockingAdminPageSkeleton";
import { ErrorDisplay } from "@/components/ui/error-display";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Calendar, CalendarDays, Info, FileDown } from "lucide-react";
import { usePendingJustifications } from "@/hooks/usePendingJustifications";
import type { Employee } from "@/types/hr";
import { calculateMonthlyPayroll } from "@/lib/payroll/calculateMonthlyPayroll";
import { generatePayrollPDF } from "@/lib/pdf/generatePayrollPDF";
import { toast } from "sonner";

export default function ClockingAdminPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { count: pendingJustifications } = usePendingJustifications();

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/hr/employees?status=active");
      const result = await response.json();

      if (result.success) {
        const filteredEmployees = (result.data || []).filter((emp: Employee) => {
          return emp.email !== "dev@coworkingcafe.com" &&
                 !(emp.firstName === "Admin" && emp.lastName === "Dev");
        });
        setEmployees(filteredEmployees);
      } else {
        setError(result.error || "Erreur lors de la récupération des employés");
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handlePreviousMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleExportPDF = useCallback(async () => {
    try {
      setIsExporting(true);
      toast.info("Génération du PDF en cours...");

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      // Calculate payroll data for current month
      const payrollData = await calculateMonthlyPayroll(employees, year, month);

      // Generate PDF
      const blob = await generatePayrollPDF({
        payrollData,
        month,
        year,
      });

      // Download PDF
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Paie_${year}-${String(month).padStart(2, "0")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF généré avec succès");
    } catch (error) {
      console.error("Error generating payroll PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setIsExporting(false);
    }
  }, [currentDate, employees]);

  if (isLoading) {
    return <ClockingAdminPageSkeleton />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchEmployees} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Récapitulatif des pointages</h1>
          <p className="text-gray-600">
            Visualisez et gérez les pointages de tous les employés
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="default"
            onClick={handleExportPDF}
            disabled={isExporting || employees.length === 0}
          >
            <FileDown className="mr-2 h-4 w-4" />
            {isExporting ? "Export en cours..." : "Exporter PDF Paie"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/hr/schedule">
              <CalendarDays className="mr-2 h-4 w-4" />
              Planning
            </Link>
          </Button>
        </div>
      </div>

      {/* Pending justifications banner */}
      {pendingJustifications > 0 && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{pendingJustifications}</strong> justification{pendingJustifications > 1 ? "s" : ""} en attente de lecture.
            Cliquez sur l'icône <strong>message</strong> (orange) d'un pointage pour la consulter.
          </AlertDescription>
        </Alert>
      )}

      {/* Time Entries List */}
      {employees.length > 0 ? (
        <TimeEntriesList
          employees={employees}
          currentDate={currentDate}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />
      ) : (
        <div className="flex h-[400px] items-center justify-center rounded-lg border">
          <div className="text-center text-muted-foreground">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4">Aucun employé actif</p>
            <p className="mt-1 text-sm">
              Ajoutez des employés depuis la section RH
            </p>
          </div>
        </div>
      )}

      {/* Info message */}
      <Alert variant="info">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Note :</strong> Vous pouvez modifier les heures de pointage en
          cliquant sur les cellules. Les modifications sont enregistrées
          automatiquement.
        </AlertDescription>
      </Alert>
    </div>
  );
}
