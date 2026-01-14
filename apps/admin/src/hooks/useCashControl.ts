import { useState, useMemo, useCallback } from "react";
import { useAccountingData } from "@/hooks/use-accounting-data";
import { useChartData } from "@/hooks/use-chart-data";
import type { CashEntryFormData, CashEntryRow } from "@/types/accounting";
import {
  mergeCashData,
  transformToTableData,
  formatFormDataForAPI,
  getAPIEndpoint,
} from "@/lib/utils/cash-control";

const initialFormData: CashEntryFormData = {
  _id: "",
  date: "",
  prestaB2B: [{ label: "", value: "" }],
  depenses: [{ label: "", value: "" }],
  virement: "",
  especes: "",
  cbClassique: "",
  cbSansContact: "",
};

/**
 * Hook pour gérer la logique du contrôle de caisse
 * Gère les données, filtres, merge turnover/cashEntries, et soumissions
 */
export function useCashControl() {
  const { dataCash, isLoading: isLoadingCash, refetch } = useAccountingData();
  const { data: turnoverData, isLoading: isLoadingTurnover } = useChartData();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [form, setForm] = useState<CashEntryFormData>(initialFormData);
  const [formStatus, setFormStatus] = useState<string | null>(null);

  // Extraire les années disponibles depuis les données turnover
  const years = useMemo(() => {
    if (!turnoverData) return [currentYear];
    const allYears = turnoverData.map((item) =>
      new Date(item.date).getFullYear()
    );
    return Array.from(new Set(allYears)).sort((a, b) => b - a);
  }, [turnoverData, currentYear]);

  // Filtrer les données turnover par année/mois sélectionnés
  const filteredTurnoverData = useMemo(() => {
    if (!turnoverData) return [];
    return turnoverData.filter((item) => {
      const d = new Date(item.date);
      const yearMatch = d.getFullYear() === selectedYear;
      const monthMatch = d.getMonth() === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [turnoverData, selectedYear, selectedMonth]);

  // Merger les données turnover + cashEntries pour avoir toutes les dates
  const mergedData = useMemo(() => {
    return mergeCashData(filteredTurnoverData, dataCash, selectedYear, selectedMonth);
  }, [filteredTurnoverData, dataCash, selectedYear, selectedMonth]);

  // Transformer les données mergées en lignes pour le tableau
  const tableData: CashEntryRow[] = useMemo(() => {
    return transformToTableData(mergedData);
  }, [mergedData]);

  // Handler pour soumettre le formulaire (création ou modification)
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setFormStatus(null);

      const isEdit = !!form._id;
      const bodyData = formatFormDataForAPI(form, isEdit);
      const { url, method } = getAPIEndpoint(isEdit);

      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        });

        const result = await res.json();

        if (result.success) {
          setFormStatus(isEdit ? "Modification réussie !" : "Ajout réussi !");

          // Rafraîchir les données
          await refetch();

          // Fermer le modal après un court délai
          setTimeout(() => {
            setFormStatus(null);
            window.dispatchEvent(new CustomEvent("cash-modal-close"));
          }, 1500);
        } else {
          setFormStatus(
            "Erreur : " + (result.error || "Impossible d'enregistrer")
          );
        }
      } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
        setFormStatus("Erreur réseau");
      }
    },
    [form, refetch]
  );

  // Handler pour supprimer une entrée
  const handleDelete = useCallback(
    (row: CashEntryRow) => {
      console.log("Delete row:", row);
      refetch();
    },
    [refetch]
  );

  return {
    // State
    form,
    setForm,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    formStatus,

    // Data
    years,
    tableData,

    // Loading
    isLoading: isLoadingCash || isLoadingTurnover,

    // Handlers
    handleSubmit,
    handleDelete,
  };
}
