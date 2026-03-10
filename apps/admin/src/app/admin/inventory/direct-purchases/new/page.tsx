"use client";

import { useState, useEffect } from "react";
import { Package, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DirectPurchaseForm } from "@/components/inventory/direct-purchases";
import type { Supplier, APIResponse } from "@/types/inventory";

export default function NewDirectPurchasePage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");

  // Fetch suppliers on mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await fetch("/api/inventory/suppliers");
        const data = (await res.json()) as APIResponse<Supplier[]>;
        if (data.success && data.data) {
          setSuppliers(data.data.filter((s) => s.isActive));
        }
      } catch (err) {
        console.error("Error fetching suppliers:", err);
      } finally {
        setLoadingSuppliers(false);
      }
    };
    fetchSuppliers();
  }, []);

  const selectedSupplier = suppliers.find((s) => s._id === selectedSupplierId);

  if (loadingSuppliers) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">Nouvel Achat Direct</h1>
          <p className="text-muted-foreground mt-1">
            Enregistrer un achat hors commande fournisseur
          </p>
        </div>
        <Button
          variant="outline"
          className="border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
          onClick={() => router.push("/admin/inventory/direct-purchases")}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Achats directs
        </Button>
      </div>

      {/* Supplier Selection */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Sélectionner un Fournisseur</h2>
          <p className="text-sm text-muted-foreground">
            Choisissez le fournisseur de cet achat
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((supplier) => {
            const isSelected = selectedSupplierId === supplier._id;
            return (
              <Card
                key={supplier._id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? "bg-green-50 border-green-200 border-2 shadow-md"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => setSelectedSupplierId(supplier._id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Package
                      className={`h-5 w-5 ${isSelected ? "text-green-600" : "text-muted-foreground"}`}
                    />
                  </div>
                  <CardTitle className="text-lg">{supplier.name}</CardTitle>
                  <CardDescription className="text-xs space-y-1">
                    <div>
                      <strong>Contact:</strong> {supplier.contact}
                    </div>
                    <div>
                      <strong>Tél:</strong> {supplier.phone}
                    </div>
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Form */}
      {selectedSupplier && (
        <DirectPurchaseForm
          supplierId={selectedSupplier._id}
          supplierName={selectedSupplier.name}
        />
      )}
    </div>
  );
}
