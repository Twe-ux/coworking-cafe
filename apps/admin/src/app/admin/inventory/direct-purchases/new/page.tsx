"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DirectPurchaseForm } from "@/components/inventory/direct-purchases";

export default function NewDirectPurchasePage() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/admin/inventory/direct-purchases")}
            className="border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Nouvel Achat Direct</h1>
            <p className="text-muted-foreground mt-1">
              Enregistrer un achat hors commande fournisseur
            </p>
          </div>
        </div>
      </div>

      <DirectPurchaseForm />
    </div>
  );
}
