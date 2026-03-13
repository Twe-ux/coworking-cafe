"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, ShoppingCart, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
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
  purchaseMarked?: boolean;
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  // Fetch out-of-stock products
  const { data: products = [], isLoading, refetch } = useQuery<OutOfStockProduct[]>({
    queryKey: ["out-of-stock"],
    queryFn: async () => {
      const res = await fetch("/api/inventory/ruptures");
      if (!res.ok) throw new Error("Failed to fetch out-of-stock products");
      const result = await res.json();
      return result.data || [];
    },
    refetchInterval: 10000, // Refresh every 10s (faster)
    refetchOnWindowFocus: true, // Refresh when window regains focus
    refetchOnMount: true, // Refresh on component mount
  });

  // Toggle purchase marked status mutation
  const toggleMutation = useMutation({
    mutationFn: async ({
      productId,
      marked,
    }: {
      productId: string;
      marked: boolean;
    }) => {
      const res = await fetch("/api/inventory/ruptures", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, marked }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update product");
      }

      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["out-of-stock"] });
      toast.success(
        variables.marked ? "Produit marqué pour achat" : "Produit décoché"
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  const handleToggle = (productId: string, currentlyMarked: boolean) => {
    toggleMutation.mutate({ productId, marked: !currentlyMarked });
  };

  // Manual refresh with animation
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    queryClient.invalidateQueries({ queryKey: ["sidebar-counts"] });
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Pull-to-refresh for mobile
  useEffect(() => {
    if (variant !== "compact") return;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        touchStartY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current) return;

      const touchY = e.touches[0].clientY;
      const distance = touchY - touchStartY.current;

      if (distance > 0 && distance < 100) {
        setPullDistance(distance);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;

      if (pullDistance > 60) {
        await handleManualRefresh();
      }

      isPulling.current = false;
      setPullDistance(0);
    };

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [variant, pullDistance, refetch, queryClient]);

  // Compact variant (mobile view)
  if (variant === "compact") {
    // Ne rien afficher pendant le chargement OU s'il n'y a pas de ruptures
    if (isLoading || products.length === 0) {
      return null;
    }

    // Séparer les produits cochés et non cochés pour l'affichage
    const uncheckedProducts = products.filter((p) => !p.purchaseMarked);
    const checkedProducts = products.filter((p) => p.purchaseMarked);

    return (
      <div className="relative">
        {/* Pull-to-refresh indicator */}
        {pullDistance > 0 && (
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full transition-transform"
            style={{ transform: `translateX(-50%) translateY(${pullDistance - 100}%)` }}
          >
            <Loader2 className={`h-5 w-5 text-orange-600 ${pullDistance > 60 ? "animate-spin" : ""}`} />
          </div>
        )}

        <Card className="border-orange-400">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Liste de Courses
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">{products.length}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5 max-h-[200px] overflow-y-auto">
          {/* Produits non cochés d'abord */}
          {uncheckedProducts.slice(0, 5).map((product) => (
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

          {/* Produits cochés (marqués pour achat) - affichage différent */}
          {checkedProducts.slice(0, Math.max(0, 5 - uncheckedProducts.length)).map((product) => (
            <div
              key={product._id}
              className="flex items-center gap-2 py-1.5 px-2 hover:bg-muted/50 rounded opacity-50"
            >
              <Checkbox
                checked={true}
                onCheckedChange={() => handleToggle(product._id, true)}
                disabled={toggleMutation.isPending}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate line-through">
                  {product.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {categoryLabels[product.category] || product.category}
                </p>
              </div>
            </div>
          ))}

          {products.length > 5 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              +{products.length - 5} autres produits
            </p>
          )}
        </CardContent>
      </Card>
      </div>
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

  const unmarkedProducts = products.filter((p) => !p.purchaseMarked);
  const markedProducts = products.filter((p) => p.purchaseMarked);

  return (
    <div className="space-y-6">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <h2 className="text-lg font-semibold">
            Produits en rupture ({products.length})
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* Unmarked products (prioritaires) */}
      {unmarkedProducts.length > 0 && (
        <div className="space-y-2">
          {unmarkedProducts.map((product) => (
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

      {/* Marked products (marqués pour achat) */}
      {markedProducts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Check className="h-4 w-4" />
            Produits marqués pour achat ({markedProducts.length})
          </h3>
          {markedProducts.map((product) => (
            <Card
              key={product._id}
              className="opacity-50 hover:opacity-100 transition-opacity"
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
    </div>
  );
}
