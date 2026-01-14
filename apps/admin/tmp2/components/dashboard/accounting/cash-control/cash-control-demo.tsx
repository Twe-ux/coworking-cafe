"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  BarChart3,
  DollarSign,
  FileText,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import CashControlTable from "./cash-control-table-generic";
import {
  CashEntryFormData,
  CashEntryFormGeneric,
} from "./cash-entry-form-generic";

// Type pour les entrées avec métadonnées
type CashEntry = CashEntryFormData & {
  id: string;
  createdAt: string;
  createdBy: string;
  status: "pending" | "validated" | "rejected";
  totalIncome: number;
  totalExpenses: number;
  balance: number;
};

// Données de démonstration
const DEMO_DATA: CashEntry[] = [
  {
    id: "1",
    date: "2024-01-15",
    prestaB2B: [
      { label: "Formation React", value: "1500" },
      { label: "Conseil technique", value: "800" },
    ],
    depenses: [
      { label: "Fournitures bureau", value: "120" },
      { label: "Café et restauration", value: "85" },
    ],
    virement: "1200",
    especes: "350",
    cbClassique: "450",
    cbSansContact: "300",
    createdAt: "2024-01-15T09:30:00Z",
    createdBy: "Marie Dubois",
    status: "validated",
    totalIncome: 2300,
    totalExpenses: 205,
    balance: 2095,
  },
  {
    id: "2",
    date: "2024-01-16",
    prestaB2B: [{ label: "Développement API", value: "2000" }],
    depenses: [
      { label: "Licences logiciels", value: "200" },
      { label: "Matériel informatique", value: "350" },
    ],
    virement: "1800",
    especes: "150",
    cbClassique: "200",
    cbSansContact: "100",
    createdAt: "2024-01-16T14:15:00Z",
    createdBy: "Jean Martin",
    status: "pending",
    totalIncome: 2250,
    totalExpenses: 550,
    balance: 1700,
  },
  {
    id: "3",
    date: "2024-01-17",
    prestaB2B: [
      { label: "Audit sécurité", value: "1200" },
      { label: "Support technique", value: "400" },
    ],
    depenses: [{ label: "Déplacement client", value: "80" }],
    virement: "900",
    especes: "200",
    cbClassique: "300",
    cbSansContact: "200",
    createdAt: "2024-01-17T11:45:00Z",
    createdBy: "Sophie Laurent",
    status: "validated",
    totalIncome: 1600,
    totalExpenses: 80,
    balance: 1520,
  },
];

type ViewMode = "table" | "form" | "dashboard";

export function CashControlDemo() {
  const [data, setData] = useState<CashEntry[]>(DEMO_DATA);
  const [currentView, setCurrentView] = useState<ViewMode>("dashboard");
  const [editingEntry, setEditingEntry] = useState<CashEntry | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Gestionnaires d'événements
  const handleCreateNew = () => {
    setEditingEntry(null);
    setIsFormOpen(true);
  };

  const handleEdit = (entry: CashEntry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleDelete = (entry: CashEntry) => {
    if (confirm(`Supprimer l'entrée du ${entry.date} ?`)) {
      setData((prev) => prev.filter((e) => e.id !== entry.id));
    }
  };

  const handleValidate = (entry: CashEntry) => {
    setData((prev) =>
      prev.map((e) =>
        e.id === entry.id ? { ...e, status: "validated" as const } : e,
      ),
    );
  };

  const handleFormSubmit = async (formData: CashEntryFormData) => {
    // Calculs automatiques
    const totalIncome =
      (parseFloat(formData.virement) || 0) +
      (parseFloat(formData.especes) || 0) +
      (parseFloat(formData.cbClassique) || 0) +
      (parseFloat(formData.cbSansContact) || 0) +
      formData.prestaB2B.reduce(
        (sum, p) => sum + (parseFloat(p.value) || 0),
        0,
      );

    const totalExpenses = formData.depenses.reduce(
      (sum, d) => sum + (parseFloat(d.value) || 0),
      0,
    );

    const newEntry: CashEntry = {
      ...formData,
      id: editingEntry?.id || `entry-${Date.now()}`,
      createdAt: editingEntry?.createdAt || new Date().toISOString(),
      createdBy: editingEntry?.createdBy || "Utilisateur actuel",
      status: editingEntry?.status || "pending",
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    };

    if (editingEntry) {
      setData((prev) =>
        prev.map((e) => (e.id === editingEntry.id ? newEntry : e)),
      );
    } else {
      setData((prev) => [...prev, newEntry]);
    }

    setIsFormOpen(false);
    setEditingEntry(null);
  };

  // Calculs pour le dashboard
  const totalBalance = data.reduce((sum, entry) => sum + entry.balance, 0);
  const pendingCount = data.filter((e) => e.status === "pending").length;
  const totalIncome = data.reduce((sum, entry) => sum + entry.totalIncome, 0);
  const totalExpenses = data.reduce(
    (sum, entry) => sum + entry.totalExpenses,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* En-tête avec navigation */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Démonstration Système Générique
              </h1>
              <p className="mt-2 text-gray-600">
                Contrôle de caisse avec formulaires et tables génériques
              </p>
            </div>

            <div className="flex space-x-2">
              <Button
                variant={currentView === "dashboard" ? "default" : "outline"}
                onClick={() => setCurrentView("dashboard")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant={currentView === "table" ? "default" : "outline"}
                onClick={() => setCurrentView("table")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Table
              </Button>
              <Button
                variant={currentView === "form" ? "default" : "outline"}
                onClick={() => setCurrentView("form")}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Formulaire
              </Button>
            </div>
          </div>
        </div>

        {/* Vue Dashboard */}
        {currentView === "dashboard" && (
          <div className="space-y-6">
            {/* Statistiques */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Solde Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      totalBalance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {totalBalance >= 0 ? "+" : ""}
                    {totalBalance.toFixed(2)} €
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Balance globale</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Revenus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {totalIncome.toFixed(2)} €
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Total des encaissements
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Dépenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    -{totalExpenses.toFixed(2)} €
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Total des sorties
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    En attente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {pendingCount}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Entrées à valider
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Actions rapides */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => setCurrentView("form")}
              >
                <CardContent className="p-6 text-center">
                  <DollarSign className="mx-auto mb-4 h-12 w-12 text-blue-500" />
                  <h3 className="mb-2 font-semibold">Nouvelle Entrée</h3>
                  <p className="text-sm text-gray-600">
                    Ajouter une nouvelle entrée de caisse
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => setCurrentView("table")}
              >
                <CardContent className="p-6 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-green-500" />
                  <h3 className="mb-2 font-semibold">Voir les Entrées</h3>
                  <p className="text-sm text-gray-600">
                    Consulter et gérer toutes les entrées
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="mx-auto mb-4 h-12 w-12 text-purple-500" />
                  <h3 className="mb-2 font-semibold">Rapports</h3>
                  <p className="text-sm text-gray-600">
                    Analyser les performances
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Aperçu des dernières entrées */}
            <Card>
              <CardHeader>
                <CardTitle>Dernières Entrées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.slice(0, 3).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <div className="font-medium">{entry.date}</div>
                        <div className="text-sm text-gray-600">
                          Par {entry.createdBy} • {entry.prestaB2B.length}{" "}
                          prestations, {entry.depenses.length} dépenses
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-medium ${
                            entry.balance >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {entry.balance >= 0 ? "+" : ""}
                          {entry.balance.toFixed(2)} €
                        </div>
                        <div
                          className={`rounded-full px-2 py-1 text-xs ${
                            entry.status === "validated"
                              ? "bg-green-100 text-green-800"
                              : entry.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {entry.status === "validated"
                            ? "Validé"
                            : entry.status === "pending"
                              ? "En attente"
                              : "Rejeté"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Vue Table */}
        {currentView === "table" && (
          <CashControlTable
            data={data}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onValidate={handleValidate}
            onCreateNew={handleCreateNew}
          />
        )}

        {/* Vue Formulaire */}
        {currentView === "form" && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setCurrentView("dashboard")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              <h2 className="text-xl font-semibold">
                Nouvelle Entrée de Caisse
              </h2>
            </div>

            <CashEntryFormGeneric onSubmit={handleFormSubmit} />
          </div>
        )}

        {/* Dialog pour l'édition */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? "Modifier l'entrée" : "Nouvelle entrée"}
              </DialogTitle>
            </DialogHeader>

            <CashEntryFormGeneric
              onSubmit={handleFormSubmit}
              initialData={editingEntry || undefined}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default CashControlDemo;
