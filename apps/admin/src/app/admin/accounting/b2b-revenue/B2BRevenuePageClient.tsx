"use client";

import { useState, useMemo } from "react";
import { useB2BRevenue } from "@/hooks/useB2BRevenue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Euro, TrendingUp, FileText } from "lucide-react";
import { B2BRevenueTable } from "@/components/accounting/b2b-revenue/B2BRevenueTable";
import { B2BRevenueModal } from "@/components/accounting/b2b-revenue/B2BRevenueModal";
import type { B2BRevenueFormData, B2BRevenueRow } from "@/types/accounting";

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

export function B2BRevenuePageClient() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<B2BRevenueRow | null>(null);

  // Calculer startDate et endDate pour le mois sélectionné
  const { startDate, endDate } = useMemo(() => {
    const start = new Date(selectedYear, selectedMonth, 1);
    const end = new Date(selectedYear, selectedMonth + 1, 0);

    return {
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
    };
  }, [selectedYear, selectedMonth]);

  const { data, isLoading, refetch, createEntry, updateEntry, deleteEntry } = useB2BRevenue({
    startDate,
    endDate,
  });

  // Calculer les années disponibles (3 dernières années)
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2];
  }, []);

  // Calculer les stats du mois
  const monthlyStats = useMemo(() => {
    const stats = {
      totalHT: 0,
      totalTTC: 0,
      totalTVA: 0,
      count: data.length,
    };

    data.forEach((entry) => {
      stats.totalHT += entry.ht || 0;
      stats.totalTTC += entry.ttc || 0;
      stats.totalTVA += entry.tva || 0;
    });

    return stats;
  }, [data]);

  const handleCreate = () => {
    setEditingEntry(null);
    setModalOpen(true);
  };

  const handleEdit = (entry: B2BRevenueRow) => {
    setEditingEntry(entry);
    setModalOpen(true);
  };

  const handleDelete = async (entry: B2BRevenueRow) => {
    const result = await deleteEntry(entry._id);
    if (!result.success) {
      alert(result.error || "Erreur lors de la suppression");
    }
  };

  const handleSubmit = async (formData: B2BRevenueFormData) => {
    let result;

    if (editingEntry) {
      result = await updateEntry(editingEntry._id, formData);
    } else {
      result = await createEntry(formData);
    }

    if (result.success) {
      setModalOpen(false);
      setEditingEntry(null);
    } else {
      alert(result.error || "Erreur lors de la sauvegarde");
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CA B2B</h1>
          <p className="text-muted-foreground mt-2">
            Gestion du chiffre d'affaires des prestations B2B
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle entrée
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Année :</span>
              <select
                className="rounded border px-3 py-2"
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
                className="rounded border px-3 py-2"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {MONTHS.map((month, idx) => (
                  <option key={month} value={idx}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total HT</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyStats.totalHT.toFixed(2)} €
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {monthlyStats.count} entrée{monthlyStats.count > 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total TTC</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyStats.totalTTC.toFixed(2)} €
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total TVA</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyStats.totalTVA.toFixed(2)} €
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux TVA moyen</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyStats.totalHT > 0
                ? ((monthlyStats.totalTVA / monthlyStats.totalHT) * 100).toFixed(1)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <B2BRevenueTable
        data={data}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      <B2BRevenueModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEntry(null);
        }}
        onSubmit={handleSubmit}
        editingEntry={editingEntry}
      />
    </div>
  );
}
