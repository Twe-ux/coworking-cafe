"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DirectPurchaseEditForm } from "@/components/inventory/direct-purchases/DirectPurchaseEditForm";
import type { DirectPurchase, APIResponse } from "@/types/inventory";

export default function EditDirectPurchasePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [purchase, setPurchase] = useState<DirectPurchase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        const res = await fetch(`/api/inventory/direct-purchases/${params.id}`);
        const data = (await res.json()) as APIResponse<DirectPurchase>;
        if (data.success && data.data) {
          setPurchase(data.data);
        }
      } catch (err) {
        console.error("Error fetching purchase:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchase();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-destructive font-medium">Achat introuvable</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/admin/inventory/direct-purchases")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux achats
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">Modifier l'Achat Direct</h1>
          <p className="text-muted-foreground mt-1">
            N° {purchase.purchaseNumber} - {purchase.supplier}
          </p>
        </div>
        <Button
          variant="outline"
          className="border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
          onClick={() => router.push("/admin/inventory/direct-purchases")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>

      {/* Edit Form */}
      <DirectPurchaseEditForm purchase={purchase} />
    </div>
  );
}
