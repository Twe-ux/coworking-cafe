"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProduitsManager } from "@/hooks/useProduitsManager";
import type { ProduitsItem, ProduitsItemType } from "@/types/produits";
import {
  ChevronDown,
  ChevronRight,
  Coffee,
  FileText,
  Gift,
  Package,
  ShoppingBasket,
  UtensilsCrossed,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ProduitsPageSkeleton } from "./ProduitsPageSkeleton";

export function ProduitsPageClient() {
  const { categories, items, loading, error } = useProduitsManager();

  const [selectedType, setSelectedType] = useState<ProduitsItemType | "all">(
    "all",
  );
  const [selectedItem, setSelectedItem] = useState<ProduitsItem | null>(null);

  const activeCategories = useMemo(
    () => categories.filter((c) => c.isActive),
    [categories],
  );
  const activeItems = useMemo(() => items.filter((i) => i.isActive), [items]);

  const stats = useMemo(
    () => ({
      total: {
        categories: activeCategories.length,
        items: activeItems.length,
      },
      drink: {
        categories: activeCategories.filter((c) => c.type === "drink").length,
        items: activeItems.filter((i) => i.type === "drink").length,
      },
      food: {
        categories: activeCategories.filter((c) => c.type === "food").length,
        items: activeItems.filter((i) => i.type === "food").length,
      },
      grocery: {
        categories: activeCategories.filter((c) => c.type === "grocery").length,
        items: activeItems.filter((i) => i.type === "grocery").length,
      },
      goodies: {
        categories: activeCategories.filter((c) => c.type === "goodies").length,
        items: activeItems.filter((i) => i.type === "goodies").length,
      },
    }),
    [activeCategories, activeItems],
  );

  const filteredCategories = useMemo(() => {
    if (selectedType === "all") return activeCategories;
    return activeCategories.filter((c) => c.type === selectedType);
  }, [activeCategories, selectedType]);

  const filteredItems = useMemo(() => {
    let result = activeItems;
    if (selectedType !== "all") {
      result = result.filter((i) => i.type === selectedType);
    }
    return [...result].sort((a, b) => a.order - b.order);
  }, [activeItems, selectedType]);

  if (loading) return <ProduitsPageSkeleton />;

  if (error) {
    return (
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group items by category
  const itemsByCategory = filteredCategories
    .map((cat) => ({
      category: cat,
      items: filteredItems.filter((i) => i.category.id === cat.id),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Produits et Recettes</h1>
        <p className="text-muted-foreground">
          Consultation des catégories et produits
        </p>
      </div>

      <StatsCards
        stats={stats}
        selectedType={selectedType}
        onSelectType={setSelectedType}
      />

      <ItemsCardGrid
        groups={itemsByCategory}
        onSelectItem={(item) => item.recipe && setSelectedItem(item)}
      />

      {/* Recipe Modal */}
      <RecipeModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}

// --- Items card grid by category ---

interface CategoryGroup {
  category: { id: string; name: string };
  items: ProduitsItem[];
}

interface ItemsCardGridProps {
  groups: CategoryGroup[];
  onSelectItem: (item: ProduitsItem) => void;
}

function ItemsCardGrid({ groups, onSelectItem }: ItemsCardGridProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Aucun item.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map(({ category, items }) => {
        const isOpen = expanded.has(category.id);
        return (
          <Card key={category.id}>
            <div
              className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => toggle(category.id)}
            >
              {isOpen ? (
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              )}
              <span className="font-semibold">{category.name}</span>
              <Badge variant="outline" className="text-xs font-normal">
                {items.length}
              </Badge>
            </div>

            {isOpen && (
              <CardContent className="border-t pt-3 pb-3">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-2 rounded-lg border p-1.5 transition-all hover:shadow-sm ${
                        item.recipe ? "cursor-pointer hover:bg-muted/50" : ""
                      }`}
                      onClick={() => onSelectItem(item)}
                    >
                      {item.image ? (
                        <div className="w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-muted-foreground/40" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {item.name}
                        </p>
                        {item.recipe && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 border  border-green-600  text-green-600 "
                          >
                            Recette
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// --- Recipe modal ---

interface RecipeModalProps {
  item: ProduitsItem | null;
  onClose: () => void;
}

function RecipeModal({ item, onClose }: RecipeModalProps) {
  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        {item && (
          <>
            <DialogHeader>
              <DialogTitle>{item.name}</DialogTitle>
            </DialogHeader>
            {item.image && (
              <div className="w-full h-48 rounded-md overflow-hidden bg-muted">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {item.description && (
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            )}
            <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
              {item.recipe}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// --- Stats cards ---

const TYPE_CARDS = [
  { type: "drink" as const, label: "Boissons", icon: Coffee, color: "blue" },
  {
    type: "food" as const,
    label: "Nourriture",
    icon: UtensilsCrossed,
    color: "orange",
  },
  {
    type: "grocery" as const,
    label: "Épicerie",
    icon: ShoppingBasket,
    color: "green",
  },
  { type: "goodies" as const, label: "Goodies", icon: Gift, color: "purple" },
] as const;

interface StatsMap {
  total: { categories: number; items: number };
  drink: { categories: number; items: number };
  food: { categories: number; items: number };
  grocery: { categories: number; items: number };
  goodies: { categories: number; items: number };
}

interface StatsCardsProps {
  stats: StatsMap;
  selectedType: ProduitsItemType | "all";
  onSelectType: (type: ProduitsItemType | "all") => void;
}

function StatsCards({ stats, selectedType, onSelectType }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {TYPE_CARDS.map(({ type, label, icon: Icon, color }) => (
        <Card
          key={type}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedType === type ? `ring-2 ring-${color}-500` : ""
          }`}
          onClick={() => onSelectType(type)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <Icon className={`w-4 h-4 text-${color}-500`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats[type].items}</div>
            <p className="text-xs text-muted-foreground">
              {stats[type].categories} catégories
            </p>
          </CardContent>
        </Card>
      ))}

      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${
          selectedType === "all" ? "ring-2 ring-primary" : ""
        }`}
        onClick={() => onSelectType("all")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <Package className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total.items}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total.categories} catégories
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
