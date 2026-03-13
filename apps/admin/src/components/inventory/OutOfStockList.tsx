"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, ShoppingCart, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface OutOfStockProduct {
  _id: string;
  name: string;
  category: string;
  supplierName: string;
  outOfStockHandledAt?: string;
  updatedAt: string;
}

interface OutOfStockListProps {
  variant?: "compact" | "full";
  showHandled?: boolean;
}

const categoryLabels: Record<string, string> = {
  food: "Alimentaire",
  cleaning: "Entretien",
  emballage: "Emballage",
  papeterie: "Papeterie",
  divers: "Divers",
};

export function OutOfStockList({
  variant = "full",
  showHandled = false,
}: OutOfStockListProps) {
  const queryClient = useQueryClient();
  const [includeHandled, setIncludeHandled] = useState(showHandled);

  // Fetch out-of-stock products
  const { data: products = [], isLoading } = useQuery<OutOfStockProduct[]>({
    queryKey: ["out-of-stock", includeHandled],
    queryFn: async () => {
      const res = await fetch(
        `/api/inventory/ruptures?includeHandled=${includeHandled}`
      );
      if (!res.ok) throw new Error("Failed to fetch out-of-stock products");
      const result = await res.json();
      return result.data || [];
    },
    refetchInterval: 30000, // Refresh every 30s
  });

  // Toggle handled status mutation
  const toggleMutation = useMutation({
    mutationFn: async ({
      productId,
      handled,
    }: {
      productId: string;
      handled: boolean;
    }) => {
      const res = await fetch("/api/inventory/ruptures", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, handled }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update product");
      }

      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["out-of-stock"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar-counts"] });
      toast.success(
        variables.handled ? "Produit marqué comme traité" : "Produit non traité"
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  const handleToggle = (productId: string, currentlyHandled: boolean) => {
    toggleMutation.mutate({ productId, handled: !currentlyHandled });
  };

  // Compact variant (mobile view)
  if (variant === "compact") {
    if (isLoading) {
      return (
        <Card className="border-orange-400">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Liste de Courses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      );
    }

    const pendingProducts = products.filter((p) => !p.outOfStockHandledAt);

    if (pendingProducts.length === 0) {
      return (
        <Card className="border-orange-400">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Liste de Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-600" />
              Aucune rupture en attente
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-orange-400">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Liste de Courses
            </CardTitle>
            <Badge variant="destructive">{pendingProducts.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5 max-h-[200px] overflow-y-auto">
          {pendingProducts.slice(0, 5).map((product) => (
            <div
              key={product._id}
              className="flex items-center gap-2 py-1.5 px-2 hover:bg-muted/50 rounded"
            >
              <Checkbox
                checked={false}
                onCheckedChange={() => handleToggle(product._id, false)}
                disabled={toggleMutation.isPending}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {categoryLabels[product.category] || product.category}
                </p>
              </div>
            </div>
          ))}
          {pendingProducts.length > 5 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              +{pendingProducts.length - 5} autres produits
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full variant (desktop page)
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                Aucun produit en rupture
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tous vos produits sont en stock
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingProducts = products.filter((p) => !p.outOfStockHandledAt);
  const handledProducts = products.filter((p) => p.outOfStockHandledAt);

  return (
    <div className="space-y-6">
      {/* Toggle handled products */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <h2 className="text-lg font-semibold">
            Produits en rupture ({pendingProducts.length})
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIncludeHandled(!includeHandled)}
          className="border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {includeHandled ? "Masquer traités" : "Afficher traités"}
        </Button>
      </div>

      {/* Pending products */}
      {pendingProducts.length > 0 && (
        <div className="space-y-2">
          {pendingProducts.map((product) => (
            <Card key={product._id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => handleToggle(product._id, false)}
                    disabled={toggleMutation.isPending}
                    className="h-5 w-5"
                  />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {categoryLabels[product.category] || product.category}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Fournisseur
                      </p>
                      <p className="text-sm font-medium">
                        {product.supplierName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Signalé le
                      </p>
                      <p className="text-sm">
                        {new Date(product.updatedAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Handled products (if shown) */}
      {includeHandled && handledProducts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Check className="h-4 w-4" />
            Produits traités ({handledProducts.length})
          </h3>
          {handledProducts.map((product) => (
            <Card
              key={product._id}
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={true}
                    onCheckedChange={() => handleToggle(product._id, true)}
                    disabled={toggleMutation.isPending}
                    className="h-5 w-5"
                  />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <p className="font-medium line-through">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {categoryLabels[product.category] || product.category}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Fournisseur
                      </p>
                      <p className="text-sm font-medium">
                        {product.supplierName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Traité le</p>
                      <p className="text-sm text-green-600">
                        {product.outOfStockHandledAt
                          ? new Date(product.outOfStockHandledAt).toLocaleDateString(
                              "fr-FR"
                            )
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
