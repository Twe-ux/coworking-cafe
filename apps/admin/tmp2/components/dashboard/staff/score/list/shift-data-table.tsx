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
  calculateTotalWorkTime,
  formatDuration,
  hasIncompleteShift,
} from "@/lib/shift-utils";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function ShiftDataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");

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

  // Filtrer et trier les données selon l'employé sélectionné et par date
  const filteredData = useMemo(() => {
    let filtered =
      selectedEmployee === "all"
        ? data
        : data.filter(
            (row: any) =>
              `${row.firstName} ${row.lastName}` === selectedEmployee,
          );

    // Trier par date (du 1er au 31)
    return filtered.sort((a: any, b: any) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [data, selectedEmployee]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleEmployeeChange = (value: string) => {
    setSelectedEmployee(value);
  };

  const clearFilter = () => {
    setSelectedEmployee("all");
  };

  // Fonction pour détecter si une ligne a un shift incomplet selon la logique d'affichage
  const hasIncompleteShiftData = (rowData: any) => {
    return hasIncompleteShift(rowData);
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
              table.getRowModel().rows.map((row) => {
                const isIncomplete = hasIncompleteShiftData(row.original);

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={isIncomplete ? "bg-red-50 hover:bg-red-100" : ""}
                  >
                    {row.getVisibleCells().map((cell, index) => (
                      <TableCell
                        key={cell.id}
                        className={`text-center ${
                          isIncomplete && index === 0
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
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {selectedEmployee === "all"
                    ? "Aucun pointage trouvé."
                    : `Aucun pointage trouvé pour ${selectedEmployee}.`}
                </TableCell>
              </TableRow>
            )}
            {/* Ligne de total */}
            {table.getRowModel().rows?.length > 0 &&
              (() => {
                let totalMinutes = 0;
                let hasAnyIncompleteShift = false;

                // Calculer le total de tous les temps de travail et vérifier les statuts
                table.getRowModel().rows.forEach((row) => {
                  const data = row.original as any;

                  // Vérifier les statuts
                  if (hasIncompleteShiftData(data)) {
                    hasAnyIncompleteShift = true;
                  }

                  // Calculer le temps total
                  const totalTimeStr = calculateTotalWorkTime(data);
                  if (totalTimeStr !== "--:--") {
                    const [hours, minutes] = totalTimeStr
                      .split(":")
                      .map(Number);
                    totalMinutes += hours * 60 + minutes;
                  }
                });

                const rowClass = hasAnyIncompleteShift
                  ? "border-red-200 bg-red-100 hover:bg-red-200"
                  : "border-blue-200 bg-blue-100 hover:bg-blue-200";

                const textColor = hasAnyIncompleteShift
                  ? "text-red-700"
                  : "text-blue-700";

                const borderClass = hasAnyIncompleteShift
                  ? "border-l-8 border-l-red-600"
                  : "";

                return (
                  <TableRow className={`border-t-2 font-semibold ${rowClass}`}>
                    <TableCell
                      className={`text-center font-bold ${borderClass}`}
                    >
                      TOTAL pour
                    </TableCell>
                    <TableCell className={`text-center font-bold ${textColor}`}>
                      {selectedEmployee === "all"
                        ? "TOUS"
                        : selectedEmployee.toUpperCase()}
                    </TableCell>
                    {/* Cellules vides pour les autres colonnes sauf les deux premières et la dernière */}
                    {columns.slice(2, -1).map((_, index) => (
                      <TableCell
                        key={`empty-${index}`}
                        className="text-center"
                      ></TableCell>
                    ))}
                    {/* Colonne Total */}
                    <TableCell className={`text-center font-bold ${textColor}`}>
                      {formatDuration(totalMinutes)}
                    </TableCell>
                  </TableRow>
                );
              })()}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
