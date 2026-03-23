"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, Save, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  OrderItemsTable,
  OrderSummarySimple,
} from "@/components/inventory/orders";
import { ProductDialog } from "@/components/inventory/products/ProductDialog";
import { useOrder } from "@/hooks/inventory/useOrder";
import { useProducts } from "@/hooks/inventory/useProducts";
import type { PurchaseOrderItem, Product, ProductFormData } from "@/types/inventory";

interface OrderItemDisplay extends PurchaseOrderItem {
  productName: string;
  unitsPerPackage?: number;
  minStock?: number;
  maxStock?: number;
  currentStock?: number;
  realStock?: number;
}

export default function OrderEditClient({ id }: { id: string }) {
  const router = useRouter();
  const { order, loading } = useOrder(id);

  const [items, setItems] = useState<OrderItemDisplay[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [stockCounts, setStockCounts] = useState<Record<string, number>>({});

  // Load products for adding to order
  const {
    products,
    loading: loadingProducts,
    refetch: refetchProducts,
    createProduct,
  } = useProducts({
    supplierId: order?.supplierId,
    active: true
  });

  // Load stock counts from DLC task (if this order comes from DLC counting)
  useEffect(() => {
    const fetchStockCounts = async () => {
      if (!id) return;

      try {
        const response = await fetch(`/api/inventory/purchase-orders/${id}/stock-counts`);
        const data = await response.json();

        if (data.success && data.data?.stockCounts) {
          // Convert array to map for easy lookup: productId -> countedStock
          const countsMap: Record<string, number> = {};
          data.data.stockCounts.forEach((item: any) => {
            countsMap[item.productId] = item.countedStock;
          });
          setStockCounts(countsMap);
        }
      } catch (error) {
        console.error('Error fetching stock counts:', error);
      }
    };

    fetchStockCounts();
  }, [id]);

  // Load order data into state and enrich with ALL supplier products (not just order items)
  useEffect(() => {
    const loadOrderWithAllProducts = async () => {
      if (!order || !products || products.length === 0) return;

      // Check if order is draft
      if (order.status !== "draft") {
        alert("Seuls les brouillons peuvent être modifiés");
        router.push(`/admin/inventory/orders/${id}`);
        return;
      }

      // Create a map of all supplier products for easy lookup
      const productsMap = new Map(products.map(p => [p._id, p]));

      // Start with order items (those with quantities > 0)
      const orderItems = order.items.map((item) => {
        const product = productsMap.get(item.productId);
        // Get stock count from:
        // 1. DLC task (stockCounts from task.metadata.stockCounts)
        // 2. Inventory (realStockCounted directly in order item)
        const countedStock = stockCounts[item.productId] ?? (item as any).realStockCounted;

        if (product) {
          return {
            ...item,
            productName: item.productName || product.name,
            unitsPerPackage: product.unitsPerPackage || 1,
            minStock: product.minStock,
            maxStock: product.maxStock,
            currentStock: product.currentStock,
            realStock: countedStock, // Stock counted by staff (DLC or Inventory)
          } as OrderItemDisplay;
        }
        // Fallback if product not found
        return {
          ...item,
          realStock: countedStock,
        } as OrderItemDisplay;
      });

      // Add ALL other supplier products (with quantity = 0) for visibility
      const orderProductIds = new Set(order.items.map(i => i.productId));
      const otherProducts = products
        .filter(p => !orderProductIds.has(p._id))
        .map(p => {
          // Get stock count from DLC task (if exists)
          const countedStock = stockCounts[p._id];

          return {
            productId: p._id,
            productName: p.name,
            quantity: 0, // Not ordered yet
            packagingType: p.packagingType,
            unitPriceHT: p.unitPriceHT,
            vatRate: p.vatRate,
            totalHT: 0,
            totalTTC: 0,
            minStock: p.minStock,
            maxStock: p.maxStock,
            currentStock: p.currentStock,
            unitsPerPackage: p.unitsPerPackage || 1,
            realStock: countedStock, // Stock counted by staff from DLC task
          } as OrderItemDisplay;
        });

      // Combine: order items first, then other products
      setItems([...orderItems, ...otherProducts]);
      setNotes(order.notes || "");
    };

    loadOrderWithAllProducts();
  }, [order, products, id, router, stockCounts]);

  /**
   * Calculate order quantity based on real stock and pack constraints
   * @param realStock - Real stock entered by user
   * @param minStock - Minimum stock level
   * @param maxStock - Maximum stock level
   * @param packagingType - Packaging type ('pack' or 'unit')
   * @param unitsPerPackage - Units per pack
   */
  const calculateOrderQuantity = (
    realStock: number,
    minStock: number,
    maxStock: number,
    packagingType: string,
    unitsPerPackage: number
  ): number => {
    // If real stock >= minStock, no need to order
    if (realStock >= minStock) return 0;

    // Calculate need
    const need = maxStock - realStock;

    // If ordering in packs, round up to next pack
    if (packagingType === "pack" && unitsPerPackage > 1) {
      const packs = Math.ceil(need / unitsPerPackage);
      return packs;
    }

    // Otherwise return need in units
    return need;
  };

  /**
   * Handle real stock change - auto-calculates order quantity
   */
  const handleRealStockChange = (
    productId: string,
    realStock: number | undefined
  ) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.productId === productId) {
          // If realStock is undefined (field empty), don't calculate
          if (realStock === undefined) {
            return { ...item, realStock: undefined };
          }

          // Auto-calculate suggested quantity
          const suggestedQty = calculateOrderQuantity(
            realStock,
            item.minStock ?? 0,
            item.maxStock ?? 0,
            item.packagingType,
            item.unitsPerPackage ?? 1
          );

          return { ...item, realStock, quantity: suggestedQty };
        }
        return item;
      })
    );
  };

  /**
   * Handle manual quantity change - clears realStock to indicate manual override
   */
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: newQuantity, realStock: undefined }
          : item
      )
    );
  };

  /**
   * Add an existing product to the order
   */
  const addProduct = (productId: string) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return;

    // Check if already added
    if (items.some((i) => i.productId === productId)) {
      alert("Ce produit est déjà dans la commande");
      return;
    }

    const newItem: OrderItemDisplay = {
      productId: product._id,
      productName: product.name,
      quantity: 0,
      packagingType: product.packagingType,
      unitPriceHT: product.unitPriceHT,
      vatRate: product.vatRate,
      totalHT: 0,
      totalTTC: 0,
      minStock: product.minStock,
      maxStock: product.maxStock,
      currentStock: product.currentStock,
      unitsPerPackage: product.unitsPerPackage || 1,
      realStock: undefined,
    };

    setItems([...items, newItem]);
  };

  /**
   * Remove a product from the order
   */
  const removeItem = (productId: string) => {
    setItems(items.filter((i) => i.productId !== productId));
  };

  /**
   * Handle product creation
   */
  const handleCreateProduct = async (
    data: ProductFormData
  ): Promise<boolean> => {
    const success = await createProduct(data);
    if (success) {
      await refetchProducts();
    }
    return success;
  };

  const handleSave = async () => {
    // Validate
    const itemsWithQty = items.filter((i) => i.quantity > 0);
    if (itemsWithQty.length === 0) {
      alert("Veuillez ajouter au moins un produit avec une quantité > 0");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/inventory/purchase-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: itemsWithQty.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          notes: notes.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
      }

      router.push(`/admin/inventory/orders/${id}`);
    } catch (error) {
      console.error("Error updating order:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour",
      );
    } finally {
      setSaving(false);
    }
  };

  // Calculate totals
  const itemsWithQty = items.filter((i) => i.quantity > 0);
  const totalHT = itemsWithQty.reduce((sum, item) => {
    const pricePerItem =
      item.packagingType === "pack" && item.unitsPerPackage
        ? item.unitPriceHT * item.unitsPerPackage
        : item.unitPriceHT;
    return sum + item.quantity * pricePerItem;
  }, 0);

  const totalTTC = itemsWithQty.reduce((sum, item) => {
    const pricePerItem =
      item.packagingType === "pack" && item.unitsPerPackage
        ? item.unitPriceHT * item.unitsPerPackage
        : item.unitPriceHT;
    return sum + item.quantity * pricePerItem * (1 + item.vatRate / 100);
  }, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Commande introuvable</p>
      </div>
    );
  }

  if (order.status !== "draft") {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Seuls les brouillons peuvent être modifiés
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/admin/inventory/orders/${id}`)}
            className="border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Modifier Commande</h1>
            <p className="text-sm text-muted-foreground">{order.orderNumber}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
          onClick={() => router.push("/admin/inventory/orders")}
        >
          <Package className="mr-2 h-4 w-4" />
          Commandes
        </Button>
      </div>

      {/* Supplier Info */}
      <Card className="flex items-center">
        <CardHeader>
          <CardTitle>Fournisseur:</CardTitle>
        </CardHeader>
        <CardContent className="flex p-6">
          <div className="text-2xl font-medium">{order.supplierName}</div>
          {/* <p className="text-sm text-muted-foreground">
            Le fournisseur ne peut pas être modifié après la création de la
            commande
          </p> */}
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Produits</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {items.length} produit(s) dans la commande
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
                onClick={() => setProductDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouveau produit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Info Banner */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>📦 Tous les produits du fournisseur sont affichés.</strong>
              <br />
              💡 <strong>Astuce:</strong> Saisissez le stock réel pour calculer
              automatiquement la quantité à commander (selon stock min/max et
              conditionnement).
            </p>
          </div>

          {/* Items Table */}
          <OrderItemsTable
            items={items}
            editable={true}
            showStockInfo={true}
            onQuantityChange={handleQuantityChange}
            onRemove={removeItem}
          />
        </CardContent>
      </Card>

      {/* Notes & Summary - Side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes - 2/3 */}
        <Card className="lg:col-span-2 h-full">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes internes (optionnel)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Commande urgente, livraison vendredi..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary - 1/3 */}
        <div className="lg:col-span-1 h-full">
          <OrderSummarySimple
            totalHT={totalHT}
            totalTTC={totalTTC}
            itemCount={itemsWithQty.length}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/inventory/orders/${id}`)}
          disabled={saving}
          className="border-red-300 text-red-700 hover:border-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <X className="mr-2 h-4 w-4" />
          Annuler
        </Button>
        <Button
          variant="outline"
          onClick={handleSave}
          disabled={saving || itemsWithQty.length === 0}
          className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>

      {/* Product Creation Dialog */}
      <ProductDialog
        open={productDialogOpen}
        onClose={() => setProductDialogOpen(false)}
        onSubmit={handleCreateProduct}
        mode="create"
      />
    </div>
  );
}
