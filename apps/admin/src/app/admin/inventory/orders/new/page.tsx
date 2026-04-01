"use client";

import { OrderItemsTable } from "@/components/inventory/orders";
import { ProductDialog } from "@/components/inventory/products/ProductDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useOrderActions } from "@/hooks/inventory/useOrderActions";
import { useProducts } from "@/hooks/inventory/useProducts";
import type {
  APIResponse,
  CreatePurchaseOrderItemData,
  Product,
  ProductFormData,
  Supplier,
} from "@/types/inventory";
import { Package, Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProductSuggestion {
  productId: string;
  productName: string;
  packagingType: string;
  currentStock: number;
  minStock: number;
  suggestedQuantity: number;
  unitPriceHT: number;
  vatRate: number;
}

interface OrderItemDisplay extends CreatePurchaseOrderItemData {
  productName: string;
  packagingType: string;
  unitPriceHT: number;
  vatRate: number;
  minStock: number;
  maxStock: number;
  currentStock: number;
  realStock?: number; // Stock réel saisi par l'utilisateur
  unitsPerPackage: number;
  totalHT: number;
  totalTTC: number;
}

export default function NewOrderPage() {
  const router = useRouter();
  const { creating, createOrder } = useOrderActions();
  const { createProduct, reactivateProduct } = useProducts({});

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inactiveProducts, setInactiveProducts] = useState<Product[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [items, setItems] = useState<OrderItemDisplay[]>([]);
  const [notes, setNotes] = useState("");
  const [inventoryInfo, setInventoryInfo] = useState<{
    date: string;
    hasData: boolean;
  } | null>(null);

  // Dialog states
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);

  // Fetch suppliers on mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Fetch products when supplier changes
  useEffect(() => {
    if (selectedSupplierId) {
      fetchProducts(selectedSupplierId);
    }
  }, [selectedSupplierId]);

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

  const fetchProducts = async (supplierId: string) => {
    setLoadingProducts(true);
    setInventoryInfo(null); // Reset inventory info when changing supplier
    try {
      // Fetch active products
      const resActive = await fetch(
        `/api/inventory/products?supplierId=${supplierId}&active=true`,
      );
      const dataActive = (await resActive.json()) as APIResponse<Product[]>;

      // Fetch latest inventory stock data for this supplier
      const resInventory = await fetch(
        `/api/inventory/entries/latest-by-supplier?supplierId=${supplierId}`,
      );
      const dataInventory = (await resInventory.json()) as APIResponse<{
        hasInventory: boolean;
        inventoryId?: string;
        inventoryDate?: string;
        finalizedAt?: string;
        stockData: Record<string, number>;
      }>;

      if (dataActive.success && dataActive.data) {
        setProducts(dataActive.data);

        const stockData = dataInventory.success && dataInventory.data
          ? dataInventory.data.stockData
          : {};

        // Store inventory info for display
        if (dataInventory.success && dataInventory.data?.hasInventory) {
          setInventoryInfo({
            date: dataInventory.data.inventoryDate || '',
            hasData: Object.keys(stockData).length > 0,
          });
        } else {
          setInventoryInfo(null);
        }

        // Automatically add all products to the order
        // Pre-fill realStock from latest inventory if available
        const newItems: OrderItemDisplay[] = dataActive.data.map((product) => {
          const realStock = stockData[product._id];
          const hasRealStock = realStock !== undefined;

          // Calculate suggested quantity if we have real stock data
          const suggestedQty = hasRealStock
            ? calculateOrderQuantity(
                realStock,
                product.minStock,
                product.maxStock,
                product.packagingType,
                product.unitsPerPackage || 1,
              )
            : 0;

          return {
            productId: product._id,
            productName: product.name,
            quantity: suggestedQty, // Pre-calculated from inventory
            packagingType: product.packagingType,
            unitPriceHT: product.unitPriceHT,
            vatRate: product.vatRate,
            minStock: product.minStock,
            maxStock: product.maxStock,
            currentStock: product.currentStock,
            realStock: hasRealStock ? realStock : undefined, // Pre-filled from inventory
            unitsPerPackage: product.unitsPerPackage || 1,
            totalHT: 0,
            totalTTC: 0,
          };
        });
        setItems(newItems);
      }

      // Fetch inactive products
      const resInactive = await fetch(
        `/api/inventory/products?supplierId=${supplierId}&active=false`,
      );
      const dataInactive = (await resInactive.json()) as APIResponse<Product[]>;
      if (dataInactive.success && dataInactive.data) {
        setInactiveProducts(dataInactive.data);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadSuggestions = async () => {
    if (!selectedSupplierId) return;

    setLoadingSuggestions(true);
    try {
      const res = await fetch(
        `/api/inventory/purchase-orders/suggestions?supplierId=${selectedSupplierId}`,
      );
      const data = (await res.json()) as APIResponse<{
        supplier: Supplier;
        suggestions: ProductSuggestion[];
      }>;

      if (data.success && data.data) {
        const newItems: OrderItemDisplay[] = data.data.suggestions.map((s) => ({
          productId: s.productId,
          productName: s.productName,
          quantity: s.suggestedQuantity,
          packagingType: s.packagingType,
          unitPriceHT: s.unitPriceHT,
          vatRate: s.vatRate || 5.5,
          minStock: 0,
          maxStock: 0,
          currentStock: 0,
          unitsPerPackage: 1,
          totalHT: 0,
          totalTTC: 0,
        }));
        setItems(newItems);
      }
    } catch (err) {
      console.error("Error loading suggestions:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

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
      quantity: product.maxStock - product.currentStock || 1,
      packagingType: product.packagingType,
      unitPriceHT: product.unitPriceHT,
      vatRate: product.vatRate,
      minStock: product.minStock,
      maxStock: product.maxStock,
      currentStock: product.currentStock,
      unitsPerPackage: product.unitsPerPackage || 1,
      totalHT: 0,
      totalTTC: 0,
    };

    setItems([...items, newItem]);
  };

  const removeItem = (productId: string) => {
    setItems(items.filter((i) => i.productId !== productId));
  };

  /**
   * Calcule la quantité à commander pour atteindre le stock maximum
   * @param realStock - Stock réel saisi
   * @param minStock - Stock minimum (non utilisé, conservé pour compatibilité)
   * @param maxStock - Stock maximum
   * @param packagingType - Type de conditionnement ('pack' ou 'unit')
   * @param unitsPerPackage - Nombre d'unités par pack
   */
  const calculateOrderQuantity = (
    realStock: number,
    minStock: number,
    maxStock: number,
    packagingType: string,
    unitsPerPackage: number,
  ): number => {
    // Si stock réel >= maxStock, pas besoin de commander
    if (realStock >= maxStock) return 0;

    // Calculer le besoin pour atteindre maxStock
    const need = maxStock - realStock;

    // Si commande en packs, arrondir au pack supérieur
    if (packagingType === "pack" && unitsPerPackage > 1) {
      const packs = Math.ceil(need / unitsPerPackage);
      return packs;
    }

    // Sinon retourner le besoin en unités
    return need;
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems(
      items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
    );
  };

  const updateRealStock = (
    productId: string,
    realStock: number | undefined,
  ) => {
    setItems(
      items.map((i) => {
        if (i.productId === productId) {
          // Si realStock est undefined (champ vide), ne pas calculer de suggestion
          if (realStock === undefined) {
            return { ...i, realStock: undefined };
          }
          // Calculer automatiquement la quantité suggérée
          const suggestedQty = calculateOrderQuantity(
            realStock,
            i.minStock,
            i.maxStock,
            i.packagingType,
            i.unitsPerPackage,
          );
          return { ...i, realStock, quantity: suggestedQty };
        }
        return i;
      }),
    );
  };

  const calculateTotals = () => {
    // Only calculate for items with quantity > 0
    const itemsWithQty = items.filter((item) => item.quantity > 0);
    const totalHT = itemsWithQty.reduce((sum, item) => {
      // If pack, multiply unitPrice by unitsPerPackage
      const pricePerItem =
        item.packagingType === "pack" && item.unitsPerPackage
          ? item.unitPriceHT * item.unitsPerPackage
          : item.unitPriceHT;
      return sum + item.quantity * pricePerItem;
    }, 0);
    // Calculate TTC using actual VAT rate of each product
    const totalTTC = itemsWithQty.reduce((sum, item) => {
      const pricePerItem =
        item.packagingType === "pack" && item.unitsPerPackage
          ? item.unitPriceHT * item.unitsPerPackage
          : item.unitPriceHT;
      const itemTotalHT = item.quantity * pricePerItem;
      const itemTotalTTC = itemTotalHT * (1 + item.vatRate / 100);
      return sum + itemTotalTTC;
    }, 0);
    return { totalHT, totalTTC, itemsCount: itemsWithQty.length };
  };

  const handleCreateProduct = async (
    data: ProductFormData,
  ): Promise<boolean> => {
    const success = await createProduct(data);
    if (success) {
      // Reload products for the selected supplier
      await fetchProducts(selectedSupplierId);
    }
    return success;
  };

  const handleReactivateProduct = async (productId: string) => {
    const success = await reactivateProduct(productId);
    if (success) {
      // Reload products for the selected supplier
      await fetchProducts(selectedSupplierId);
      setReactivateDialogOpen(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedSupplierId) {
      alert("Veuillez sélectionner un fournisseur");
      return;
    }

    // Filter items with quantity > 0
    const itemsToOrder = items.filter((item) => item.quantity > 0);

    if (itemsToOrder.length === 0) {
      alert("Veuillez saisir au moins un produit avec une quantité > 0");
      return;
    }

    // Convert to API format (only productId + quantity)
    const orderItems: CreatePurchaseOrderItemData[] = itemsToOrder.map(
      (item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }),
    );

    const result = await createOrder({
      supplierId: selectedSupplierId,
      items: orderItems,
      notes,
    });

    if (result.success && result.orderId) {
      router.push(`/admin/inventory/orders/${result.orderId}`);
    } else {
      alert(`Erreur: ${result.error || "Erreur inconnue"}`);
    }
  };

  const { totalHT, totalTTC, itemsCount } = calculateTotals();
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
          <h1 className="text-3xl font-bold">Nouvelle Commande Fournisseur</h1>
          <p className="text-muted-foreground mt-1">
            Créer un brouillon de commande
          </p>
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

      {/* Supplier Selection */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Sélectionner un Fournisseur</h2>
          <p className="text-sm text-muted-foreground">
            Choisissez le fournisseur pour cette commande
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

      {/* Products */}
      {selectedSupplierId && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Produits</CardTitle>
                <CardDescription>
                  {loadingProducts
                    ? "Chargement des produits..."
                    : `${items.length} produit(s) disponible(s) - Ajustez les quantités nécessaires`}
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                {inactiveProducts.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-orange-500 text-orange-700 hover:bg-orange-50 hover:text-orange-700 whitespace-nowrap"
                    onClick={() => setReactivateDialogOpen(true)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Réactiver
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700 whitespace-nowrap"
                  onClick={() => setProductDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau produit
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Items Table */}
            {loadingProducts ? (
              <div className="text-center py-8 text-muted-foreground">
                Chargement des produits...
              </div>
            ) : (
              <>
                {inventoryInfo?.hasData ? (
                  <div className="text-sm bg-green-50 border border-green-200 rounded-md p-3 mb-2">
                    📊 <strong>Stocks pré-remplis</strong> depuis l'inventaire du{' '}
                    <strong>{new Date(inventoryInfo.date).toLocaleDateString('fr-FR')}</strong>.
                    Les quantités à commander ont été calculées automatiquement (Stock Max - Stock Réel).
                    Vous pouvez les ajuster si nécessaire.
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground mb-2">
                    💡 <strong>Astuce:</strong> Saisissez le stock réel pour
                    calculer automatiquement la quantité à commander (selon
                    min/max et conditionnement pack). Vous pouvez aussi saisir
                    directement la quantité.
                  </div>
                )}
                <OrderItemsTable
                  items={items}
                  editable
                  showStockInfo
                  onRemove={removeItem}
                  onQuantityChange={updateQuantity}
                  onRealStockChange={updateRealStock}
                />
              </>
            )}

            {/* Totals */}
            {itemsCount > 0 && (
              <div className="flex justify-end">
                <div className="space-y-2 min-w-[250px]">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{itemsCount} produit(s) à commander</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total HT</span>
                    <span className="font-medium">{totalHT.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total TTC</span>
                    <span>{totalTTC.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {selectedSupplierId && (
        <Card>
          <CardHeader>
            <CardTitle>Notes (optionnel)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Notes internes sur cette commande..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {selectedSupplierId && (
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button
            variant="outline"
            className="border-red-300 text-red-700 hover:border-red-500 hover:bg-red-50 hover:text-red-700"
            onClick={() => router.push("/admin/inventory/orders")}
          >
            Annuler
          </Button>
          <Button
            variant="outline"
            className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
            onClick={handleCreate}
            disabled={creating || itemsCount === 0}
          >
            {creating ? "Création..." : "Créer la commande"}
          </Button>
        </div>
      )}

      {/* Product Creation Dialog */}
      <ProductDialog
        open={productDialogOpen}
        onClose={() => setProductDialogOpen(false)}
        onSubmit={handleCreateProduct}
        mode="create"
      />

      {/* Reactivate Product Dialog */}
      <Dialog
        open={reactivateDialogOpen}
        onOpenChange={setReactivateDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réactiver un produit</DialogTitle>
            <DialogDescription>
              Sélectionnez un produit désactivé à réactiver
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {inactiveProducts.map((product) => (
              <Card
                key={product._id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleReactivateProduct(product._id)}
              >
                <CardHeader className="py-3 px-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-sm">{product.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {product.packagingType} -{" "}
                        {product.unitPriceHT.toFixed(2)} €
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
