"use client";

import {
  ShiftData,
  calculateTotalWorkTime,
  formatTime,
  getDisplayShifts,
} from "@/lib/shift-utils";
import { UpdateShiftProps } from "@/store/shift/api";
import { ColumnDef } from "@tanstack/react-table";
import { EditableCell } from "./editable-cell";

// Fonction pour créer les colonnes avec le callback de mise à jour
export const createColumns = (
  onUpdateShift: (update: UpdateShiftProps) => Promise<void>,
): ColumnDef<ShiftData>[] => [
  {
    id: "firstName",
    header: "Prénom",
    accessorKey: "firstName",
  },
  {
    id: "lastName",
    header: "Nom",
    accessorKey: "lastName",
  },
  {
    id: "date",
    header: "Date",
    accessorKey: "date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return date.toLocaleDateString("fr-FR");
    },
  },
  {
    id: "firstShiftStart",
    header: "Shift 1 - Début",
    cell: ({ row }) => {
      const shifts = getDisplayShifts(row.original);

      // Si getDisplayShifts dit qu'il n'y a rien à afficher ici, ne rien afficher
      if (shifts.firstShiftStart === "--:--") {
        return ""; // Cellule vide
      }

      // Déterminer quelle donnée est affichée
      const isFromSecondShift =
        shifts.firstShiftStart === formatTime(row.original.secondShift.start);

      return (
        <EditableCell
          value={
            isFromSecondShift
              ? row.original.secondShift.start
              : row.original.firstShift.start
          }
          onSave={(newValue) =>
            onUpdateShift({
              shiftId: row.original._id,
              field: isFromSecondShift
                ? "secondShift.start"
                : "firstShift.start",
              value: newValue,
            })
          }
          type="time"
          placeholder="HH:MM"
        />
      );
    },
  },
  {
    id: "firstShiftEnd",
    header: "Shift 1 - Fin",
    cell: ({ row }) => {
      const shifts = getDisplayShifts(row.original);

      // Si le shift de début n'est pas affiché, ne pas afficher la fin non plus
      if (shifts.firstShiftStart === "--:--") {
        return "";
      }

      if (shifts.firstShiftEnd === "--:--") {
        // Déterminer quel champ éditer selon l'affichage du début
        const isEditingSecondShift =
          shifts.firstShiftStart === formatTime(row.original.secondShift.start);

        return (
          <EditableCell
            value={
              isEditingSecondShift
                ? row.original.secondShift.end
                : row.original.firstShift.end
            }
            onSave={(newValue) =>
              onUpdateShift({
                shiftId: row.original._id,
                field: isEditingSecondShift
                  ? "secondShift.end"
                  : "firstShift.end",
                value: newValue,
              })
            }
            type="time"
            placeholder="HH:MM"
          />
        );
      }

      const isFromSecondShift =
        shifts.firstShiftEnd === formatTime(row.original.secondShift.end);

      return (
        <EditableCell
          value={
            isFromSecondShift
              ? row.original.secondShift.end
              : row.original.firstShift.end
          }
          onSave={(newValue) =>
            onUpdateShift({
              shiftId: row.original._id,
              field: isFromSecondShift ? "secondShift.end" : "firstShift.end",
              value: newValue,
            })
          }
          type="time"
          placeholder="HH:MM"
        />
      );
    },
  },
  {
    id: "secondShiftStart",
    header: "Shift 2 - Début",
    cell: ({ row }) => {
      const shifts = getDisplayShifts(row.original);

      if (shifts.secondShiftStart === "--:--") {
        return ""; // Cellule vide
      }

      const isFromFirstShift =
        shifts.secondShiftStart === formatTime(row.original.firstShift.start);

      return (
        <EditableCell
          value={
            isFromFirstShift
              ? row.original.firstShift.start
              : row.original.secondShift.start
          }
          onSave={(newValue) =>
            onUpdateShift({
              shiftId: row.original._id,
              field: isFromFirstShift
                ? "firstShift.start"
                : "secondShift.start",
              value: newValue,
            })
          }
          type="time"
          placeholder="HH:MM"
        />
      );
    },
  },
  {
    id: "secondShiftEnd",
    header: "Shift 2 - Fin",
    cell: ({ row }) => {
      const shifts = getDisplayShifts(row.original);

      // Si le shift de début n'est pas affiché, ne pas afficher la fin non plus
      if (shifts.secondShiftStart === "--:--") {
        return "";
      }

      if (shifts.secondShiftEnd === "--:--") {
        // Déterminer quel champ éditer selon l'affichage du début
        const isEditingFirstShift =
          shifts.secondShiftStart === formatTime(row.original.firstShift.start);

        return (
          <EditableCell
            value={
              isEditingFirstShift
                ? row.original.firstShift.end
                : row.original.secondShift.end
            }
            onSave={(newValue) =>
              onUpdateShift({
                shiftId: row.original._id,
                field: isEditingFirstShift
                  ? "firstShift.end"
                  : "secondShift.end",
                value: newValue,
              })
            }
            type="time"
            placeholder="HH:MM"
          />
        );
      }

      const isFromFirstShift =
        shifts.secondShiftEnd === formatTime(row.original.firstShift.end);

      return (
        <EditableCell
          value={
            isFromFirstShift
              ? row.original.firstShift.end
              : row.original.secondShift.end
          }
          onSave={(newValue) =>
            onUpdateShift({
              shiftId: row.original._id,
              field: isFromFirstShift ? "firstShift.end" : "secondShift.end",
              value: newValue,
            })
          }
          type="time"
          placeholder="HH:MM"
        />
      );
    },
  },
  {
    id: "totalWorkTime",
    header: "Total",
    cell: ({ row }) => {
      const totalTime = calculateTotalWorkTime(row.original);
      return <span className="font-medium text-blue-600">{totalTime}</span>;
    },
  },
];

// Export des colonnes par défaut pour la rétrocompatibilité
export const columns: ColumnDef<ShiftData>[] = [
  {
    id: "firstName",
    header: "Prénom",
    accessorKey: "firstName",
  },
  {
    id: "lastName",
    header: "Nom",
    accessorKey: "lastName",
  },
  {
    id: "date",
    header: "Date",
    accessorKey: "date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return date.toLocaleDateString("fr-FR");
    },
  },
  {
    id: "firstShiftStart",
    header: "Shift 1 - Début",
    cell: ({ row }) => {
      const shifts = getDisplayShifts(row.original);
      return shifts.firstShiftStart;
    },
  },
  {
    id: "firstShiftEnd",
    header: "Shift 1 - Fin",
    cell: ({ row }) => {
      const shifts = getDisplayShifts(row.original);
      return shifts.firstShiftEnd;
    },
  },
  {
    id: "secondShiftStart",
    header: "Shift 2 - Début",
    cell: ({ row }) => {
      const shifts = getDisplayShifts(row.original);
      return shifts.secondShiftStart;
    },
  },
  {
    id: "secondShiftEnd",
    header: "Shift 2 - Fin",
    cell: ({ row }) => {
      const shifts = getDisplayShifts(row.original);
      return shifts.secondShiftEnd;
    },
  },
  {
    id: "totalWorkTime",
    header: "Total",
    cell: ({ row }) => {
      const totalTime = calculateTotalWorkTime(row.original);
      return <span className="font-medium text-blue-600">{totalTime}</span>;
    },
  },
  // {
  //   id: "actions",
  //   header: "Actions",
  //   cell: ({ row }) => {
  //     // Actions pour modifier/supprimer si nécessaire
  //   },
  // },
];
