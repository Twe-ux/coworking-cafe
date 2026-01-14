"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react"; // Importer useState pour gérer l'état du filtre

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Type pour les données de shift avec toutes les propriétés nécessaires
interface ShiftData {
  id: string;
  firstName: string;
  lastName: string;
  startTime: string;
  endTime?: string;
  active: boolean;
  startTimeFirst?: string;
  endTimeFirst?: string;
  startTimeSecond?: string;
  endTimeSecond?: string;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends ShiftData, TValue>({
  columns,
  data = [], // Ajout d'une valeur par défaut pour éviter les erreurs
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  // console.log("DataTable data:", data);
  const formatTime = (time: string) => {
    if (!time) return "00:00"; // Retourner 00:00 si la chaîne est vide
    const date = new Date(time);
    if (isNaN(date.getTime())) return "Pointage manquant"; // Retourner 00:00 si la date est invalide
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  interface GroupedRow {
    startTimeFirst: string;
    startTimeSecond: string;
    [key: string]: any;
  }

  const groupedData: Record<string, GroupedRow> = data.reduce(
    (acc, row) => {
      const key = `${row.firstName}-${row.lastName}-${new Date(
        row.startTime,
      ).toDateString()}`; // Clé unique par utilisateur et date
      console.log(`Clé générée : ${key}`); // Log pour vérifier les clés
      const time = new Date(row.startTime);
      const isAfternoon =
        time.getUTCHours() > 14 ||
        (time.getUTCHours() === 14 && time.getUTCMinutes() > 30);

      if (!acc[key]) {
        acc[key] = {
          id: row.id, // Utilisation de l'ID pour identifier la ligne
          date: new Date(row.startTime).toLocaleDateString("fr-FR"), // Formater la date en DD/MM/YYYY
          firstName: row.firstName, // Prénom de l'utilisateur
          lastName: row.lastName, // Nom de l'utilisateur
          startTimeFirst: isAfternoon ? "" : row.startTime,
          endTimeFirst: isAfternoon ? "" : row.endTime,
          startTimeSecond: isAfternoon ? row.startTime : "",
          endTimeSecond: isAfternoon ? row.endTime : "",
        };
      } else {
        if (isAfternoon && !acc[key].startTimeSecond) {
          acc[key].startTimeSecond = row.startTime;
          acc[key].endTimeSecond = row.endTime;
        } else if (!isAfternoon && !acc[key].startTimeFirst) {
          acc[key].startTimeFirst = row.startTime;
          acc[key].endTimeFirst = row.endTime;
        } else {
          console.warn(`Plus de deux entrées pour la clé ${key}`);
        }
      }
      return acc;
    },
    {} as Record<string, GroupedRow>,
  );

  const formattedData = Object.values(groupedData).map((row, index) => {
    return {
      id: row.id || `row-${index}`, // Ajout d'un id unique si absent
      ...row,
      startTimeFirst: row.startTimeFirst ? formatTime(row.startTimeFirst) : "",
      endTimeFirst: row.endTimeFirst ? formatTime(row.endTimeFirst) : "",
      startTimeSecond: row.startTimeSecond
        ? formatTime(row.startTimeSecond)
        : "",
      endTimeSecond: row.endTimeSecond ? formatTime(row.endTimeSecond) : "",
      firstName: row.firstName, // Ajout du prénom dans les données formatées
      lastName: row.lastName, // Ajout du nom dans les données formatées
    };
  });

  console.log("Données regroupées:", groupedData);
  console.log("Données formatées:", formattedData);

  const [selectedUser, setSelectedUser] = useState<string | null>(null); // État pour l'utilisateur sélectionné
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<TData | null>(null);

  const uniqueUsers = Array.from(
    new Set(data.map((row) => `${row.firstName} ${row.lastName}`)),
  ); // Extraire les utilisateurs uniques

  const filteredData = selectedUser
    ? formattedData.filter(
        (row) => `${row.firstName} ${row.lastName}` === selectedUser,
      )
    : formattedData; // Filtrer les données formatées si un utilisateur est sélectionné

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUser(event.target.value || null); // Mettre à jour l'utilisateur sélectionné
  };

  const handleRowClick = (row: TData) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
  };

  // console.log("DataTable data:", data);
  // console.log("Formatted time:", formatTime(data[0].startTime || "12:34"));

  return (
    <div>
      <div className="py-6">
        <label htmlFor="user-filter" className="mb-2 block text-sm font-medium">
          Filtrer par utilisateur :
        </label>
        <select
          id="user-filter"
          className="block w-full rounded-md border p-2"
          value={selectedUser || ""}
          onChange={handleUserChange}
        >
          <option value="">Tous les utilisateurs</option>
          {uniqueUsers.map((user) => (
            <option key={user} value={user}>
              {user}
            </option>
          ))}
        </select>
      </div>
      <Table className="border-2 border-gray-200">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              className="bg-gray-200 hover:bg-gray-200"
              key={headerGroup.id}
            >
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
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
          {filteredData.length ? (
            filteredData.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => handleRowClick(row as unknown as TData)}
                className="cursor-pointer hover:bg-blue-200"
              >
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    {
                      row[
                        column.id as
                          | "startTimeFirst"
                          | "endTimeFirst"
                          | "startTimeSecond"
                          | "endTimeSecond"
                          | "id"
                      ]
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Modal */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <Dialog onOpenChange={handleCloseModal}>
            <div className="relative z-10 w-full max-w-md rounded-md border-[1px] border-gray-400 bg-white p-4 text-center shadow-2xl">
              <h2 className="text-lg font-bold">
                Modifier les pointages de {selectedRow?.firstName}{" "}
                {selectedRow?.lastName}
              </h2>
              {selectedRow && (
                <div className="mt-4 flex flex-col gap-4">
                  <div className="flex w-full justify-center space-x-4">
                    <div className="flex flex-col">
                      <label className="block text-center text-sm font-medium">
                        startTimeFirst
                      </label>
                      <input
                        type="text"
                        value={selectedRow?.startTimeFirst || ""}
                        className="mt-1 block h-8 rounded-md border-[0.5px] border-gray-300 text-center shadow-sm sm:text-sm"
                        onChange={() => {}}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block text-center text-sm font-medium">
                        endTimeFirst
                      </label>
                      <input
                        type="text"
                        value={selectedRow?.endTimeFirst || ""}
                        className="mt-1 block h-8 rounded-md border-[0.5px] border-gray-300 text-center shadow-sm sm:text-sm"
                        onChange={() => {}}
                      />
                    </div>
                  </div>
                  <div className="flex w-full justify-center space-x-4">
                    <div className="flex flex-col">
                      <label className="block text-center text-sm font-medium">
                        startTimeSecond
                      </label>
                      <input
                        type="text"
                        value={selectedRow?.startTimeSecond || ""}
                        className="mt-1 block h-8 rounded-md border-[0.5px] border-gray-300 text-center shadow-sm sm:text-sm"
                        onChange={() => {}}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block text-center text-sm font-medium">
                        endTimeSecond
                      </label>
                      <input
                        type="text"
                        value={selectedRow?.endTimeSecond || ""}
                        className="mt-1 block h-8 rounded-md border-[0.5px] border-gray-300 text-center shadow-sm sm:text-sm"
                        onChange={() => {}}
                      />
                    </div>
                  </div>
                  <div className="flex w-full justify-center space-x-4">
                    <Button
                      variant="destructive"
                      onClick={handleCloseModal}
                      className="mt-4 w-[100px]"
                    >
                      Annuler
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleCloseModal}
                      className="mt-4 w-[100px]"
                    >
                      Enregistrer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Dialog>
        </div>
      )}
    </div>
  );
}
