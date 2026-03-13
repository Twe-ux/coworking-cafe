"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface Product {
  _id: string;
  name: string;
  currentStock: number;
  category: string;
}

export function OutOfStockAlert() {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  // Recherche de produits avec debounce
  const searchProducts = useCallback(async (search: string) => {
    if (search.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `/api/inventory/products/search?q=${encodeURIComponent(search)}`,
      );
      if (!res.ok) throw new Error("Failed to fetch products");
      const result = await res.json();
      setSuggestions(result.data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Search error:", error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (searchTerm) {
      debounceTimer.current = setTimeout(() => {
        searchProducts(searchTerm);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm, searchProducts]);

  // Report out of stock mutation
  const reportMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetch("/api/inventory/report-out-of-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to report out of stock");
      }

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`Rupture de stock signalée : ${data.productName}`);
      setSelectedProduct(null);
      setSearchTerm("");
      setSuggestions([]);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors du signalement");
    },
  });

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchTerm(product.name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleClearSelection = () => {
    setSelectedProduct(null);
    setSearchTerm("");
    setSuggestions([]);
  };

  const handleReport = () => {
    if (selectedProduct) {
      reportMutation.mutate(selectedProduct._id);
    }
  };

  return (
    <Card className="border-orange-400 border">
      <CardContent className="p-3 ">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0" />

          <div className="flex-1 relative">
            <div className="relative">
              <Input
                type="text"
                placeholder="Recherche ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() =>
                  suggestions.length > 0 && setShowSuggestions(true)
                }
                className={selectedProduct ? "pr-8" : ""}
              />
              {selectedProduct && (
                <button
                  onClick={handleClearSelection}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
                {suggestions.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => handleSelectProduct(product)}
                    className="w-full px-3 py-2 text-left hover:bg-accent cursor-pointer flex flex-col"
                    type="button"
                  >
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Stock : {product.currentStock} • {product.category}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No results */}
            {showSuggestions &&
              suggestions.length === 0 &&
              searchTerm.length >= 2 &&
              !isSearching && (
                <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md p-3">
                  <p className="text-sm text-muted-foreground">
                    Aucun produit trouvé
                  </p>
                </div>
              )}
          </div>

          <Button
            onClick={handleReport}
            disabled={!selectedProduct || reportMutation.isPending}
            className="bg-orange-600 hover:bg-orange-700 shrink-0"
          >
            {reportMutation.isPending ? "Signalement..." : "Signaler"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
