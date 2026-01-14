import { useState, useMemo, useCallback } from "react";
import { useAccountingData } from "@/hooks/use-accounting-data";
import { useChartData } from "@/hooks/use-chart-data";
import type { CashEntry, CashEntryFormData, CashEntryRow } from "@/types/accounting";

interface MergedCashData {
  _id: string;
  date: string;
  TTC?: number;
  HT?: number;
  TVA?: number;
  prestaB2B: Array<{ label: string; value: number }>;
  depenses: Array<{ label: string; value: number }>;
  virement: number | null;
  especes: number | null;
  cbClassique: number | null;
  cbSansContact: number | null;
  source: "turnover" | "cashEntry";
}

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
  const mergedData = useMemo((): MergedCashData[] => {
    if (!filteredTurnoverData && !dataCash) return [];

    const allDatesMap = new Map<string, MergedCashData>();

    // Ajouter toutes les dates de turnover
    filteredTurnoverData?.forEach((turnoverItem) => {
      allDatesMap.set(turnoverItem.date, {
        _id: turnoverItem.date,
        date: turnoverItem.date,
        TTC: turnoverItem.TTC,
        HT: turnoverItem.HT,
        TVA: turnoverItem.TVA ?? 0,
        prestaB2B: [],
        depenses: [],
        virement: null,
        especes: null,
        cbClassique: null,
        cbSansContact: null,
        source: "turnover",
      });
    });

    // Ajouter toutes les dates de cashEntry qui correspondent aux filtres
    dataCash?.forEach((entry: CashEntry) => {
      const entryDate = entry._id;

      // Vérifier si cette date correspond aux filtres actuels
      if (entryDate) {
        const d = new Date(entryDate.replace(/\//g, "-"));
        const yearMatch = d.getFullYear() === selectedYear;
        const monthMatch = d.getMonth() === selectedMonth;

        if (yearMatch && monthMatch) {
          const existing = allDatesMap.get(entryDate);
          if (existing) {
            // Fusionner avec données turnover existantes
            allDatesMap.set(entryDate, {
              ...existing,
              prestaB2B: entry.prestaB2B || [],
              depenses: entry.depenses || [],
              virement: entry.virement ?? null,
              especes: entry.especes ?? null,
              cbClassique: entry.cbClassique ?? null,
              cbSansContact: entry.cbSansContact ?? null,
            });
          } else {
            // Créer nouvelle entrée (date sans turnover)
            allDatesMap.set(entryDate, {
              _id: entryDate,
              date: entryDate,
              TTC: 0,
              HT: 0,
              TVA: 0,
              prestaB2B: entry.prestaB2B || [],
              depenses: entry.depenses || [],
              virement: entry.virement ?? null,
              especes: entry.especes ?? null,
              cbClassique: entry.cbClassique ?? null,
              cbSansContact: entry.cbSansContact ?? null,
              source: "cashEntry",
            });
          }
        }
      }
    });

    // Convertir le Map en tableau et trier par date
    return Array.from(allDatesMap.values()).sort(
      (a, b) =>
        new Date(a.date.replace(/\//g, "-")).getTime() -
        new Date(b.date.replace(/\//g, "-")).getTime()
    );
  }, [filteredTurnoverData, dataCash, selectedYear, selectedMonth]);

  // Transformer les données mergées en lignes pour le tableau
  const tableData: CashEntryRow[] = useMemo(() => {
    return mergedData.map((entry) => {
      const totalB2B =
        entry.prestaB2B?.reduce(
          (sum, item) => sum + (Number(item.value) || 0),
          0
        ) || 0;

      const totalDepenses =
        entry.depenses?.reduce(
          (sum, item) => sum + (Number(item.value) || 0),
          0
        ) || 0;

      const totalCA = totalB2B - totalDepenses;

      const totalEncaissements =
        (entry.especes || 0) +
        (entry.virement || 0) +
        (entry.cbClassique || 0) +
        (entry.cbSansContact || 0);

      return {
        _id: entry._id,
        date: entry.date,
        TTC: entry.TTC || 0,
        HT: entry.HT || 0,
        TVA: entry.TVA || 0,
        totalCA,
        totalEncaissements,
        totalB2B,
        totalDepenses,
        especes: entry.especes || 0,
        virement: entry.virement || 0,
        cbClassique: entry.cbClassique || 0,
        cbSansContact: entry.cbSansContact || 0,
        prestaB2B: entry.prestaB2B,
        depenses: entry.depenses,
      };
    });
  }, [mergedData]);

  // Handler pour soumettre le formulaire (création ou modification)
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setFormStatus(null);

      // Formater la date pour l'envoi
      let dateToSend = form.date;
      if (dateToSend.includes("/")) {
        dateToSend = dateToSend.replace(/\//g, "-");
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateToSend)) {
        const d = new Date(dateToSend);
        if (!isNaN(d.getTime())) {
          dateToSend = d.toISOString().slice(0, 10);
        }
      }

      // Formater la date en YYYY/MM/DD pour la clé MongoDB
      const dateKey = dateToSend.replace(/-/g, "/");

      // Préparer les données à envoyer
      const bodyData: Record<string, unknown> = {
        date: dateToSend,
        prestaB2B: form.prestaB2B
          .filter((p) => p.label && p.value !== "" && !isNaN(Number(p.value)))
          .map((p) => ({
            label: p.label,
            value: Number(p.value),
          })),
        depenses: form.depenses
          .filter((d) => d.label && d.value !== "" && !isNaN(Number(d.value)))
          .map((d) => ({
            label: d.label,
            value: Number(d.value),
          })),
        virement: form.virement !== "" ? Number(form.virement) : 0,
        especes: form.especes !== "" ? Number(form.especes) : 0,
        cbClassique: form.cbClassique !== "" ? Number(form.cbClassique) : 0,
        cbSansContact:
          form.cbSansContact !== "" ? Number(form.cbSansContact) : 0,
      };

      let url = "/api/cash-entry";
      let method: "POST" | "PUT" = "POST";

      if (form._id) {
        // Mode édition
        url = "/api/cash-entry/update";
        method = "PUT";
        bodyData.id = form._id;
      } else {
        // Mode création
        bodyData._id = dateKey;
      }

      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        });

        const result = await res.json();

        if (result.success) {
          setFormStatus(form._id ? "Modification réussie !" : "Ajout réussi !");

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
