"use client";

import { useState } from "react";
import { useCashControl } from "@/hooks/useCashControl";
import { columns } from "@/components/accounting/cash-control/columns";
import { DataTable } from "@/components/accounting/cash-control/data-table";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { generateCashControlPDF } from "@/lib/pdf/cash-control-pdf";
import { toast } from "sonner";

const monthsList = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

/**
 * Page de contrôle de caisse
 * Affiche un tableau avec les données de turnover et cash entries
 * Permet la création/modification d'entrées de caisse
 */
export default function CashControlPage() {
  const {
    form,
    setForm,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    formStatus,
    years,
    tableData,
    turnoverData,
    isLoading,
    handleSubmit,
    handleDelete,
  } = useCashControl();

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateCashControlPDF({
        turnoverData: tableData,
        month: selectedMonth,
        year: selectedYear,
      });
      toast.success('PDF généré avec succès !');
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">
              Contrôle de Caisse
            </h1>

            {/* Filtres Année/Mois + Bouton PDF */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Année :</span>
                <select
                  className="rounded border px-3 py-1"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold">Mois :</span>
                <select
                  className="rounded border px-3 py-1"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {monthsList.map((month, idx) => (
                    <option key={month} value={idx}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={handleGeneratePDF}
                disabled={isGeneratingPDF || tableData.length === 0}
                size="sm"
              >
                {isGeneratingPDF ? (
                  <>Génération...</>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 mr-2" />
                    Générer PDF
                  </>
                )}
              </Button>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={tableData}
            form={form}
            setForm={setForm}
            formStatus={formStatus}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </>
  );
}
