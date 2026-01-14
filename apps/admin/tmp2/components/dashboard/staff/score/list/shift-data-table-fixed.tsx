"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

// Importer la fonction getDisplayShifts pour la logique de détection
// Fonction pour vérifier si une valeur de shift est vide
const isEmptyShiftValue = (value: string): boolean => {
  return !value || value === "00:00" || value === "0000-01-01T00:00:00.000Z";
};

// Fonction pour vérifier si une heure est après 14h30
const isAfternoonShift = (timeString: string) => {
  if (!timeString || timeString === "00:00") return false;
  try {
    const date = new Date(timeString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return hours > 14 || (hours === 14 && minutes >= 30);
  } catch {
    return false;
  }
};

// Fonction pour formater l'heure
const formatTime = (isoString: string) => {
  if (!isoString || isoString === "00:00" || isNaN(Date.parse(isoString)))
    return "--:--";
  const date = new Date(isoString);
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Copie de getDisplayShifts pour détecter les shifts incomplets
const getDisplayShifts = (data: any) => {
  const { firstShift, secondShift } = data;

  let displayFirstStart = "--:--";
  let displayFirstEnd = "--:--";
  let displaySecondStart = "--:--";
  let displaySecondEnd = "--:--";

  // Vérifier si les shifts ont des starts valides (on ne montre que les shifts avec un start)
  const hasFirstShift = !isEmptyShiftValue(firstShift.start);
  const hasSecondShift = !isEmptyShiftValue(secondShift.start);

  if (hasFirstShift && hasSecondShift) {
    const firstIsAfternoon = isAfternoonShift(firstShift.start);
    const secondIsAfternoon = isAfternoonShift(secondShift.start);

    if (firstIsAfternoon && secondIsAfternoon) {
      displayFirstStart = formatTime(firstShift.start);
      displayFirstEnd = formatTime(firstShift.end);
      displaySecondStart = formatTime(secondShift.start);
      displaySecondEnd = formatTime(secondShift.end);

      return {
        firstShiftStart: displayFirstStart,
        firstShiftEnd: displayFirstEnd,
        secondShiftStart: displaySecondStart,
        secondShiftEnd: displaySecondEnd,
      };
    }
  }

  // Traiter firstShift s'il existe et a un start valide
  if (hasFirstShift) {
    if (isAfternoonShift(firstShift.start)) {
      displaySecondStart = formatTime(firstShift.start);
      displaySecondEnd = formatTime(firstShift.end);
    } else {
      displayFirstStart = formatTime(firstShift.start);
      displayFirstEnd = formatTime(firstShift.end);
    }
  }

  // Traiter secondShift s'il existe et a un start valide
  if (hasSecondShift) {
    if (isAfternoonShift(secondShift.start)) {
      displaySecondStart = formatTime(secondShift.start);
      displaySecondEnd = formatTime(secondShift.end);
    } else {
      displayFirstStart = formatTime(secondShift.start);
      displayFirstEnd = formatTime(secondShift.end);
    }
  }

  return {
    firstShiftStart: displayFirstStart,
    firstShiftEnd: displayFirstEnd,
    secondShiftStart: displaySecondStart,
    secondShiftEnd: displaySecondEnd,
  };
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function ShiftDataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");

  // Analyser les données pour détecter s'il y a des seconds shifts
  const hasAnySecondShift = useMemo(() => {
    return data.some((item: any) => {
      const secondShiftStart = item.secondShift?.start;
      const secondShiftEnd = item.secondShift?.end;
      return (
        (secondShiftStart &&
          secondShiftStart !== "00:00" &&
          secondShiftStart !== "0000-01-01T00:00:00.000Z") ||
        (secondShiftEnd &&
          secondShiftEnd !== "00:00" &&
          secondShiftEnd !== "0000-01-01T00:00:00.000Z")
      );
    });
  }, [data]);

  // Garder toutes les colonnes visibles
  const filteredColumns = columns;

  // Extraire la liste unique des employés des données
  const employees = useMemo(() => {
    const employeeSet = new Set<string>();
    data.forEach((row: any) => {
      if (row.firstName && row.lastName) {
        employeeSet.add(`${row.firstName} ${row.lastName}`);
      }
    });
    return Array.from(employeeSet).sort();
  }, [data]);

  // Filtrer les données selon l'employé sélectionné
  const filteredData = useMemo(() => {
    if (selectedEmployee === "all") return data;
    return data.filter(
      (row: any) => `${row.firstName} ${row.lastName}` === selectedEmployee,
    );
  }, [data, selectedEmployee]);

  const table = useReactTable({
    data: filteredData,
    columns: filteredColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleEmployeeChange = (value: string) => {
    setSelectedEmployee(value);
  };

  const clearFilter = () => {
    setSelectedEmployee("all");
  };

  // Fonction pour détecter si une ligne a un shift incomplet selon la logique d'affichage
  const hasIncompleteShift = (rowData: any) => {
    const shifts = getDisplayShifts(rowData);

    // Vérifier si un shift affiché a un début mais pas de fin
    const firstShiftIncomplete =
      shifts.firstShiftStart !== "--:--" && shifts.firstShiftEnd === "--:--";
    const secondShiftIncomplete =
      shifts.secondShiftStart !== "--:--" && shifts.secondShiftEnd === "--:--";

    // Debug pour voir si la détection fonctionne
    if (firstShiftIncomplete || secondShiftIncomplete) {
      console.log("Shift incomplet détecté:", {
        employee: `${rowData.firstName} ${rowData.lastName}`,
        shifts,
        firstShiftIncomplete,
        secondShiftIncomplete,
      });
    }

    return firstShiftIncomplete || secondShiftIncomplete;
  };

  return (
    <div className="space-y-4">
      {/* Filtre par employé */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Select value={selectedEmployee} onValueChange={handleEmployeeChange}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filtrer par employé" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les employés</SelectItem>
              {employees.map((employee: string) => (
                <SelectItem key={employee} value={employee}>
                  {employee}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedEmployee !== "all" && (
            <Button variant="outline" size="sm" onClick={clearFilter}>
              Effacer
            </Button>
          )}
        </div>

        {/* Indicateurs */}
        <div className="text-muted-foreground text-sm">
          <span>
            {selectedEmployee === "all"
              ? `${filteredData.length} pointage(s) - ${employees.length} employé(s)`
              : `${filteredData.length} pointage(s) pour ${selectedEmployee}`}
          </span>
        </div>
      </div>

      {/* Tableau */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-center">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={
                    hasIncompleteShift(row.original)
                      ? "bg-red-50 hover:bg-red-100"
                      : ""
                  }
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      key={cell.id}
                      className={`text-center ${
                        hasIncompleteShift(row.original) && index === 0
                          ? "border-l-8 border-l-red-600"
                          : ""
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={filteredColumns.length}
                  className="h-24 text-center"
                >
                  {selectedEmployee === "all"
                    ? "Aucun pointage trouvé."
                    : `Aucun pointage trouvé pour ${selectedEmployee}.`}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
