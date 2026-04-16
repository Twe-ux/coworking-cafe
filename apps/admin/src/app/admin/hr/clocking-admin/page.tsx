"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import TimeEntriesList from "@/components/clocking/TimeEntriesList";
import { ClockingAdminPageSkeleton } from "./ClockingAdminPageSkeleton";
import { ErrorDisplay } from "@/components/ui/error-display";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Calendar, CalendarDays, Info, FileText, Mail, X } from "lucide-react";
import { usePendingJustifications } from "@/hooks/usePendingJustifications";
import type { Employee } from "@/types/hr";
import { calculateMonthlyPayroll } from "@/lib/payroll/calculateMonthlyPayroll";
import { generatePayrollPDF } from "@/lib/pdf/generatePayrollPDF";
import { PayrollPreviewModal } from "@/components/hr/payroll/PayrollPreviewModal";
import { toast } from "sonner";

export default function ClockingAdminPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isSendingIndividual, setIsSendingIndividual] = useState(false);
  const [pendingIndividualSend, setPendingIndividualSend] = useState(false);
  const { count: pendingJustifications } = usePendingJustifications();

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      // fullData=true pour récupérer address et socialSecurityNumber (nécessaire pour PDF paie)
      const response = await fetch("/api/hr/employees?status=active&fullData=true");
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

  const handleSendIndividualEmails = useCallback(async () => {
    if (!pendingIndividualSend) {
      setPendingIndividualSend(true);
      return;
    }

    try {
      setIsSendingIndividual(true);
      setPendingIndividualSend(false);
      toast.info("Calcul des heures en cours...");

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const payrollData = await calculateMonthlyPayroll(employees, year, month);

      const employeesData = payrollData
        .map((data) => {
          const emp = employees.find(
            (e) => e.id === data.employeeId || e._id === data.employeeId
          );
          return {
            email: emp?.email ?? "",
            firstName: data.firstName,
            lastName: data.lastName,
            monthlyContractualHours: data.monthlyContractualHours,
            hoursWorked: data.hoursWorked,
            paidLeaveHours: data.paidLeaveHours,
            sickLeaveHours: data.sickLeaveHours,
            overtimeHours: data.overtimeHours,
          };
        })
        .filter((e) => e.email);

      toast.info(`Envoi à ${employeesData.length} employé(s)...`);

      const response = await fetch("/api/hr/payroll/send-individual-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeesData, month, year }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Récapitulatifs envoyés à ${result.sentCount} employé(s)`);
      } else {
        toast.error(result.error || "Erreur lors de l'envoi");
      }
    } catch (error) {
      console.error("Error sending individual emails:", error);
      toast.error("Erreur lors de l'envoi des emails");
    } finally {
      setIsSendingIndividual(false);
    }
  }, [pendingIndividualSend, currentDate, employees]);

  const handleGeneratePDF = useCallback(async () => {
    try {
      setIsGenerating(true);
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

      // Store blob and open preview modal
      setPdfBlob(blob);
      setIsPreviewOpen(true);
      toast.success("PDF généré avec succès");
    } catch (error) {
      console.error("Error generating payroll PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setIsGenerating(false);
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
          {pendingIndividualSend ? (
            <>
              <Button
                variant="outline"
                onClick={handleSendIndividualEmails}
                disabled={isSendingIndividual}
                className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
              >
                <Mail className="mr-2 h-4 w-4" />
                Confirmer ({employees.length} employés)
              </Button>
              <Button
                variant="outline"
                onClick={() => setPendingIndividualSend(false)}
                className="border-gray-300 text-gray-500 hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={handleSendIndividualEmails}
              disabled={isSendingIndividual || employees.length === 0}
              className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
            >
              <Mail className="mr-2 h-4 w-4" />
              {isSendingIndividual ? "Envoi..." : "Envoyer récap employés"}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleGeneratePDF}
            disabled={isGenerating || employees.length === 0}
            className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
          >
            <FileText className="mr-2 h-4 w-4" />
            {isGenerating ? "Génération..." : "Générer PDF Paie"}
          </Button>
          <Button
            variant="outline"
            asChild
            className="border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
          >
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

      {/* Payroll Preview Modal */}
      <PayrollPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        pdfBlob={pdfBlob}
        month={currentDate.getMonth() + 1}
        year={currentDate.getFullYear()}
      />
    </div>
  );
}
