"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DirectPurchaseList } from "@/components/inventory/direct-purchases";
import type { DirectPurchase, APIResponse } from "@/types/inventory";

export default function DirectPurchasesPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<DirectPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/direct-purchases");
      const data = (await res.json()) as APIResponse<DirectPurchase[]>;
      if (data.success && data.data) {
        setPurchases(data.data);
      }
    } catch (err) {
      console.error("Error fetching direct purchases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  // Stats for current month
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthPurchases = purchases.filter((p) => p.date.startsWith(currentMonth));
  const monthTotal = monthPurchases.reduce((sum, p) => sum + p.totalTTC, 0);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">Achats Directs</h1>
          <p className="text-muted-foreground mt-1">
            Achats effectues hors commandes fournisseurs
          </p>
        </div>
        <Button
          variant="outline"
          className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
          onClick={() => router.push("/admin/inventory/direct-purchases/new")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouvel achat direct
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Achats ce mois</CardDescription>
            <CardTitle className="text-2xl">{monthPurchases.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total TTC ce mois</CardDescription>
            <CardTitle className="text-2xl">
              {monthTotal.toFixed(2)} EUR
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Purchases List */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-blue-600" />
            <CardTitle>Historique</CardTitle>
          </div>
          <CardDescription>
            {purchases.length} achat{purchases.length > 1 ? "s" : ""} au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DirectPurchaseList
            purchases={purchases}
            loading={false}
            onRefresh={fetchPurchases}
          />
        </CardContent>
      </Card>
    </div>
  );
}
