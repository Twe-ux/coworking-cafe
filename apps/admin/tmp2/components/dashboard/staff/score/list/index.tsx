import { AddShiftModal } from "@/components/dashboard/staff/score/list/add-shift-modal";
import { createColumns } from "@/components/dashboard/staff/score/list/columns";
import { useShiftDataFixed } from "@/hooks/use-shift-data-fixed";
import { ShiftData, UpdateShiftProps } from "@/lib/shift-utils";
import { useUpdateShiftMutation } from "@/store/shift/api";
import { StaffApi } from "@/store/staff";
import { useTypedDispatch } from "@/store/types";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { ShiftDataTable } from "./shift-data-table";

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

export default function ScoreList() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number | null>(currentYear);
  const currentMonth = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    currentMonth,
  );
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const dispatch = useTypedDispatch();

  // Utiliser le cache Singleton pour récupérer les shifts
  const { isLoading, error, refetch, shifts } = useShiftDataFixed();
  const [updateShift] = useUpdateShiftMutation();

  // Écouter les changements de focus pour rafraîchir automatiquement
  useEffect(() => {
    const handleFocus = async () => {
      await refetch();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetch]);

  useEffect(() => {
    dispatch(StaffApi.fetchData());
  }, [dispatch]);

  // Traiter les données des shifts
  const data = shifts || [];
  const shiftDates = useMemo(() => {
    const dates = data.map((shift: ShiftData) => new Date(shift.date));
    return dates.filter((date: Date) => !isNaN(date.getTime()));
  }, [data]);

  const years = useMemo(() => {
    if (!shiftDates) return [];
    const allYears = shiftDates.map((date: Date) => date.getFullYear());
    return Array.from(new Set(allYears)).sort((a: number, b: number) => b - a);
  }, [shiftDates]);

  const months = useMemo(() => {
    if (!shiftDates || !selectedYear) return [];
    const allMonths = shiftDates
      .filter((date: Date) => date.getFullYear() === selectedYear)
      .map((date: Date) => date.getMonth());
    const uniqueMonths = Array.from(new Set(allMonths)).sort(
      (a: number, b: number) => a - b,
    );
    return uniqueMonths;
  }, [shiftDates, selectedYear]);

  const days = useMemo(() => {
    if (!shiftDates || selectedYear === null || selectedMonth === null)
      return [];
    const allDays = shiftDates
      .filter(
        (date: Date) =>
          date.getFullYear() === selectedYear &&
          date.getMonth() === selectedMonth,
      )
      .map((date: Date) => date.getDate());
    return Array.from(new Set(allDays)).sort((a: number, b: number) => a - b);
  }, [shiftDates, selectedYear, selectedMonth]);

  // État pour stocker les données de shifts - remplacé par le cache Singleton
  // const [data, setData] = useState<ShiftData[]>([]);

  // Fonction pour mettre à jour un shift avec RTK Query
  const handleUpdateShift = async (update: UpdateShiftProps) => {
    try {
      await updateShift(update).unwrap();
      toast.success("Shift mis à jour avec succès");

      // Rafraîchir le cache après la mise à jour
      await refetch();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Erreur lors de la mise à jour du shift");
    }
  };

  // Créer les colonnes avec la fonction de mise à jour
  const editableColumns = useMemo(() => createColumns(handleUpdateShift), []);

  // Filtrer les données selon année, mois et jour seulement
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item: ShiftData) => {
      const d = new Date(item.date);
      const yearMatch = selectedYear ? d.getFullYear() === selectedYear : true;
      const monthMatch =
        selectedMonth !== null ? d.getMonth() === selectedMonth : true;
      const dayMatch =
        selectedDay !== null ? d.getDate() === selectedDay : true;
      return yearMatch && monthMatch && dayMatch;
    });
  }, [data, selectedYear, selectedMonth, selectedDay]);

  // Afficher l'état de chargement
  if (isLoading) {
    return (
      <div className="container mx-auto px-4">
        <div className="rounded-md border p-4">
          <div className="text-center">Chargement des pointages...</div>
        </div>
      </div>
    );
  }

  // Afficher les erreurs
  if (error) {
    return (
      <div className="container mx-auto px-4">
        <div className="rounded-md border p-4">
          <div className="space-y-4">
            <div className="text-center text-red-600">
              Erreur lors du chargement des pointages
            </div>
            <div className="text-muted-foreground text-center text-sm">
              {typeof error === "string" ? error : "Une erreur est survenue"}
            </div>
            <div className="text-center">
              <button
                onClick={() => refetch()}
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="rounded-md border">
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">Année :</span>
              <select
                className="mr-4 rounded border px-3 py-1"
                value={selectedYear ?? ""}
                onChange={(e) =>
                  setSelectedYear(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              >
                {years.map((year: number) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <span className="font-semibold">Mois :</span>
              <select
                className="mr-4 rounded border px-3 py-1"
                value={selectedMonth ?? ""}
                onChange={(e) =>
                  setSelectedMonth(
                    e.target.value !== "" ? Number(e.target.value) : null,
                  )
                }
              >
                {months.map((month: number) => (
                  <option key={month} value={month}>
                    {monthsList[month]}
                  </option>
                ))}
              </select>
              <span className="font-semibold">Jour :</span>
              <select
                className="rounded border px-3 py-1"
                value={selectedDay ?? ""}
                onChange={(e) =>
                  setSelectedDay(
                    e.target.value !== "" ? Number(e.target.value) : null,
                  )
                }
              >
                <option value="">Tous les jours</option>
                {days.map((day: number) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            {/* Bouton d'ajout de pointage */}
            <AddShiftModal />
          </div>
          <ShiftDataTable columns={editableColumns} data={filteredData} />
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Score List",
  description:
    "List of daily scores for staff members, sortable by month and user",
};
