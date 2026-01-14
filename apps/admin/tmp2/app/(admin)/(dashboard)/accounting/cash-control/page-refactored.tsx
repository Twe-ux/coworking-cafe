"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarIcon,
  CreditCardIcon,
  DollarSignIcon,
  TrendingUpIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

// Hooks optimisés
import { useCashEntryDataFixed } from "@/hooks/use-cash-entry-data-fixed";
import { useChartData } from "@/hooks/use-chart-data-fixed";

// Types
interface CashEntry {
  _id: string;
  date: string;
  depenses?: { label: string; value: number }[];
  prestaB2B: { label: string; value: number }[];
  especes: number;
  virement: number;
  cbClassique: number;
  cbSansContact: number;
}

interface CashControlStats {
  totalEspeces: number;
  totalCB: number;
  totalVirements: number;
  totalDepenses: number;
  nbEntries: number;
}

export default function CashControlRefactored() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");

  // Hooks pour les données
  const { dataCash, isLoading: cashLoading, refetch } = useCashEntryDataFixed();
  const { data: turnoverData, isLoading: turnoverLoading } = useChartData();

  // Calculs des statistiques
  const stats = useMemo((): CashControlStats => {
    if (!dataCash || dataCash.length === 0) {
      return {
        totalEspeces: 0,
        totalCB: 0,
        totalVirements: 0,
        totalDepenses: 0,
        nbEntries: 0,
      };
    }

    return dataCash.reduce(
      (acc, entry) => {
        const especes = Number(entry.especes) || 0;
        const cbClassique = Number(entry.cbClassique) || 0;
        const cbSansContact = Number(entry.cbSansContact) || 0;
        const virement = Number(entry.virement) || 0;
        const depenses =
          entry.depenses?.reduce(
            (sum, dep) => sum + (Number(dep.value) || 0),
            0,
          ) || 0;

        return {
          totalEspeces: acc.totalEspeces + especes,
          totalCB: acc.totalCB + cbClassique + cbSansContact,
          totalVirements: acc.totalVirements + virement,
          totalDepenses: acc.totalDepenses + depenses,
          nbEntries: acc.nbEntries + 1,
        };
      },
      {
        totalEspeces: 0,
        totalCB: 0,
        totalVirements: 0,
        totalDepenses: 0,
        nbEntries: 0,
      },
    );
  }, [dataCash]);

  const isLoading = cashLoading || turnoverLoading;

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contrôle Caisse</h1>
          <p className="text-muted-foreground">
            Gestion des entrées et sorties de caisse - Version Refactorisée
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            <CalendarIcon className="mr-1 h-4 w-4" />
            {new Date().toLocaleDateString()}
          </Badge>
          <Button onClick={() => refetch()} disabled={isLoading}>
            {isLoading ? "Actualisation..." : "Actualiser"}
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Espèces</CardTitle>
            <DollarSignIcon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalEspeces.toFixed(2)}€
            </div>
            <p className="text-muted-foreground text-xs">
              {stats.nbEntries} entrées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cartes Bancaires
            </CardTitle>
            <CreditCardIcon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalCB.toFixed(2)}€
            </div>
            <p className="text-muted-foreground text-xs">
              Total CB + Sans contact
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Virements</CardTitle>
            <TrendingUpIcon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalVirements.toFixed(2)}€
            </div>
            <p className="text-muted-foreground text-xs">
              Paiements dématérialisés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dépenses</CardTitle>
            <div className="h-4 w-4 rounded-full bg-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{stats.totalDepenses.toFixed(2)}€
            </div>
            <p className="text-muted-foreground text-xs">Sorties de caisse</p>
          </CardContent>
        </Card>
      </div>

      {/* Interface principale avec onglets */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="entries">Saisie d'entrées</TabsTrigger>
          <TabsTrigger value="table">Tableau détaillé</TabsTrigger>
          <TabsTrigger value="demo">Démo & Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Résumé des Opérations</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {(
                          stats.totalEspeces +
                          stats.totalCB +
                          stats.totalVirements
                        ).toFixed(2)}
                        €
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Total Recettes
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-red-600">
                        -{stats.totalDepenses.toFixed(2)}€
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Total Dépenses
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {(
                          stats.totalEspeces +
                          stats.totalCB +
                          stats.totalVirements -
                          stats.totalDepenses
                        ).toFixed(2)}
                        €
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Solde Net
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {stats.nbEntries}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Nombre d'Entrées
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entries">
          <Card>
            <CardHeader>
              <CardTitle>Nouvelle Entrée de Caisse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Formulaire de saisie d'entrée caisse en cours de
                  développement...
                </p>
                <Button onClick={() => refetch()}>
                  Actualiser les données
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Entrées</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <div className="max-h-96 overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                          <tr>
                            <th className="p-2 text-left">Date</th>
                            <th className="p-2 text-right">Espèces</th>
                            <th className="p-2 text-right">CB</th>
                            <th className="p-2 text-right">Virement</th>
                            <th className="p-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dataCash?.slice(0, 10).map((entry, index) => (
                            <tr
                              key={entry._id || index}
                              className="hover:bg-muted/20 border-b"
                            >
                              <td className="p-2">{entry.date}</td>
                              <td className="p-2 text-right">
                                {Number(entry.especes || 0).toFixed(2)}€
                              </td>
                              <td className="p-2 text-right">
                                {(
                                  Number(entry.cbClassique || 0) +
                                  Number(entry.cbSansContact || 0)
                                ).toFixed(2)}
                                €
                              </td>
                              <td className="p-2 text-right">
                                {Number(entry.virement || 0).toFixed(2)}€
                              </td>
                              <td className="p-2 text-right font-medium">
                                {(
                                  Number(entry.especes || 0) +
                                  Number(entry.cbClassique || 0) +
                                  Number(entry.cbSansContact || 0) +
                                  Number(entry.virement || 0)
                                ).toFixed(2)}
                                €
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {dataCash && dataCash.length > 10 && (
                    <p className="text-muted-foreground text-center text-sm">
                      Affichage des 10 dernières entrées sur {dataCash.length}{" "}
                      total
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demo">
          <Card>
            <CardHeader>
              <CardTitle>Démo & Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Module de démonstration et tests en cours de développement...
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline">Test Connexion API</Button>
                  <Button variant="outline">Générer Données Test</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
