import { CashEntry as CashEntryType } from "@/store/cashentry/state";
import { useCallback, useMemo, useState } from "react";

// Types spécifiques pour les données de chiffre d'affaires (différentes de CashEntry)
export type TurnoverData = {
  _id: string;
  date: string;
  TTC?: number;
  HT?: number;
  TVA?: number;
  depenses?: { label: string; value: number }[];
  prestaB2B?: { label: string; value: number }[];
  especes?: number | string;
  virement?: number | string;
  cbClassique?: number | string;
  cbSansContact?: number | string;
  [key: string]: unknown;
};

// Type pour les entrées de caisse (réutilise le type du store)
export type CashEntry = CashEntryType;

export type DateRange = {
  from: string;
  to: string;
};

export type FilterOptions = {
  selectedYear: number | null;
  selectedMonth: number | null;
  dateRange: DateRange;
};

// Hook pour la gestion des filtres
export function useCashControlFilters() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState<number | null>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    currentMonth,
  );
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(currentYear, currentMonth - 1, 1).toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
  });

  const updateYear = useCallback(
    (year: number | null) => {
      setSelectedYear(year);
      if (year) {
        const month = selectedMonth || 1;
        setDateRange({
          from: new Date(year, month - 1, 1).toISOString().slice(0, 10),
          to: new Date(year, month, 0).toISOString().slice(0, 10),
        });
      }
    },
    [selectedMonth],
  );

  const updateMonth = useCallback(
    (month: number | null) => {
      setSelectedMonth(month);
      if (month && selectedYear) {
        setDateRange({
          from: new Date(selectedYear, month - 1, 1).toISOString().slice(0, 10),
          to: new Date(selectedYear, month, 0).toISOString().slice(0, 10),
        });
      }
    },
    [selectedYear],
  );

  const updateDateRange = useCallback((range: DateRange) => {
    setDateRange(range);
    // Optionnel: extraire l'année/mois de la plage
    const fromDate = new Date(range.from);
    setSelectedYear(fromDate.getFullYear());
    setSelectedMonth(fromDate.getMonth() + 1);
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);
    setDateRange({
      from: new Date(currentYear, currentMonth - 1, 1)
        .toISOString()
        .slice(0, 10),
      to: new Date().toISOString().slice(0, 10),
    });
  }, [currentYear, currentMonth]);

  return {
    selectedYear,
    selectedMonth,
    dateRange,
    updateYear,
    updateMonth,
    updateDateRange,
    resetFilters,
  };
}

// Hook pour les calculs financiers
export function useCashControlCalculations(
  turnoverData: TurnoverData[],
  cashData: CashEntry[],
) {
  return useMemo(() => {
    // Calculs pour les données de turnover
    const totalTurnover = turnoverData.reduce(
      (sum, item) => sum + (item.TTC || 0),
      0,
    );
    const totalHT = turnoverData.reduce((sum, item) => sum + (item.HT || 0), 0);
    const totalTVA = turnoverData.reduce(
      (sum, item) => sum + (item.TVA || 0),
      0,
    );

    // Calculs pour les moyens de paiement
    const paymentMethods = cashData.reduce(
      (acc, item) => ({
        virement: acc.virement + (parseFloat(String(item.virement || 0)) || 0),
        cbClassique:
          acc.cbClassique + (parseFloat(String(item.cbClassique || 0)) || 0),
        cbSansContact:
          acc.cbSansContact +
          (parseFloat(String(item.cbSansContact || 0)) || 0),
        especes: acc.especes + (parseFloat(String(item.especes || 0)) || 0),
      }),
      { virement: 0, cbClassique: 0, cbSansContact: 0, especes: 0 },
    );

    const totalPayments =
      paymentMethods.virement +
      paymentMethods.cbClassique +
      paymentMethods.cbSansContact +
      paymentMethods.especes;

    // Calculs pour les prestations et dépenses (depuis turnoverData)
    const prestations = turnoverData.flatMap((item) => item.prestaB2B || []);
    const depenses = turnoverData.flatMap((item) => item.depenses || []);

    const totalPrestations = prestations.reduce(
      (sum, presta) => sum + (presta.value || 0),
      0,
    );
    const totalDepenses = depenses.reduce(
      (sum, depense) => sum + (depense.value || 0),
      0,
    );

    // Différence pour la vérification
    const difference = totalTurnover - totalPayments;

    return {
      turnover: {
        total: totalTurnover,
        ht: totalHT,
        tva: totalTVA,
      },
      payments: {
        ...paymentMethods,
        total: totalPayments,
      },
      prestations: {
        items: prestations,
        total: totalPrestations,
      },
      depenses: {
        items: depenses,
        total: totalDepenses,
      },
      difference,
      isBalanced: Math.abs(difference) < 0.01,
    };
  }, [turnoverData, cashData]);
}

// Hook pour la gestion PDF
export function useCashControlPDF() {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generatePDF = useCallback(
    async (data: CashEntry[], calculations: any, dateRange: DateRange) => {
      setIsGeneratingPDF(true);

      try {
        // Logique de génération PDF
        console.log("Génération PDF avec:", { data, calculations, dateRange });

        // Ici on utiliserait le composant PDF refactorisé
        // const PDFComponent = <PDFCashControlRefactored ... />;

        // Simulation d'un délai de génération
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return true;
      } catch (error) {
        console.error("Erreur lors de la génération PDF:", error);
        throw error;
      } finally {
        setIsGeneratingPDF(false);
      }
    },
    [],
  );

  return {
    generatePDF,
    isGeneratingPDF,
  };
}

// Hook pour la gestion des actions
export function useCashControlActions(refetchData: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeAction = useCallback(
    async (action: () => Promise<void>, successMessage?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await action();
        if (successMessage) {
          // toast.success(successMessage);
          console.log(successMessage);
        }
        refetchData();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Une erreur est survenue";
        setError(errorMessage);
        // toast.error(errorMessage);
        console.error("Erreur:", errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [refetchData],
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    executeAction,
    isLoading,
    error,
    clearError,
  };
}

// Utilitaires pour les dates
export const dateUtils = {
  formatYYYYMMDD: (dateStr: string): string => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  },

  formatDDMMYYYY: (dateStr: string): string => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${day}/${month}/${year}`;
  },

  getMonthName: (monthIndex: number): string => {
    const months = [
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
    return months[monthIndex - 1] || "";
  },

  getYearsList: (startYear?: number, endYear?: number): number[] => {
    const start = startYear || new Date().getFullYear() - 5;
    const end = endYear || new Date().getFullYear() + 1;
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  },

  isDateInRange: (date: string, range: DateRange): boolean => {
    const dateObj = new Date(date);
    const fromObj = new Date(range.from);
    const toObj = new Date(range.to);
    return dateObj >= fromObj && dateObj <= toObj;
  },
};

// Constantes utiles
export const CASH_CONTROL_CONSTANTS = {
  MONTHS: [
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
  ],
  PAYMENT_METHODS: [
    "virement",
    "cbClassique",
    "cbSansContact",
    "especes",
  ] as const,
  DEFAULT_PAGE_SIZE: 10,
} as const;

// Types pour les exports
export type CashControlFilters = ReturnType<typeof useCashControlFilters>;
export type CashControlCalculations = ReturnType<
  typeof useCashControlCalculations
>;
export type CashControlPDF = ReturnType<typeof useCashControlPDF>;
export type CashControlActions = ReturnType<typeof useCashControlActions>;
