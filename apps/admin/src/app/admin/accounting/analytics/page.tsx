'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import type { AnalyticsFilters as Filters } from '@/hooks/useAnalyticsData';
import {
  AnalyticsFilters,
  RevenueCards,
  RevenueChart,
  BreakdownChart,
  B2BRevenueDialog,
  DetailedView,
  B2BListView,
} from '@/components/accounting/analytics';

export default function AnalyticsPage() {
  const [filters, setFilters] = useState<Filters>({
    period: 'month',
    compareWith: 'previous',
    mode: 'ttc',
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, isError, error } = useAnalyticsData(filters);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics CA</h1>
          <p className="text-gray-600 mt-1">
            Vue d&apos;ensemble de votre chiffre d&apos;affaires
          </p>
        </div>

        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter CA B2B
        </Button>
      </div>

      <Tabs defaultValue="detailed" className="space-y-6">
        <TabsList>
          <TabsTrigger value="summary">Vue Résumé</TabsTrigger>
          <TabsTrigger value="detailed">Vue Détaillée</TabsTrigger>
          <TabsTrigger value="b2b">Factures B2B</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <AnalyticsFilters filters={filters} onChange={setFilters} />

          {isLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-[400px] rounded-lg" />
              <Skeleton className="h-[400px] rounded-lg" />
            </div>
          ) : isError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800 font-semibold">
                Erreur lors du chargement des données
              </p>
              <p className="text-red-600 text-sm mt-2">
                {error instanceof Error ? error.message : 'Une erreur est survenue'}
              </p>
            </div>
          ) : data ? (
            <>
              <RevenueCards
                data={data.current}
                comparison={data.comparison}
                mode={filters.mode}
              />

              <RevenueChart data={data.chartData} mode={filters.mode} />

              <BreakdownChart data={data.breakdown} />
            </>
          ) : null}
        </TabsContent>

        <TabsContent value="detailed">
          <DetailedView />
        </TabsContent>

        <TabsContent value="b2b">
          <B2BListView />
        </TabsContent>
      </Tabs>

      <B2BRevenueDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
