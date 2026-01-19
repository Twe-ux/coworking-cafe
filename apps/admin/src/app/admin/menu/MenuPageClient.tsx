"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coffee, UtensilsCrossed, ArrowRight, Layers, PackageOpen } from "lucide-react";
import { MenuPageSkeleton } from "./MenuPageSkeleton";
import type { MenuCategory, MenuItem } from "@/types/menu";

interface MenuStats {
  totalCategories: number;
  totalItems: number;
  drinkCategories: number;
  drinkItems: number;
  foodCategories: number;
  foodItems: number;
}

export function MenuPageClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<MenuStats>({
    totalCategories: 0,
    totalItems: 0,
    drinkCategories: 0,
    drinkItems: 0,
    foodCategories: 0,
    foodItems: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all categories
      const categoriesRes = await fetch("/api/menu/categories");
      const categoriesData = await categoriesRes.json();

      if (!categoriesData.success) {
        throw new Error(categoriesData.error || "Erreur lors de la récupération des catégories");
      }

      const categories: MenuCategory[] = categoriesData.data || [];

      // Fetch all items
      const itemsRes = await fetch("/api/menu/items");
      const itemsData = await itemsRes.json();

      if (!itemsData.success) {
        throw new Error(itemsData.error || "Erreur lors de la récupération des items");
      }

      const items: MenuItem[] = itemsData.data || [];

      // Calculate stats
      setStats({
        totalCategories: categories.length,
        totalItems: items.length,
        drinkCategories: categories.filter((c) => c.type === "drink").length,
        drinkItems: items.filter((i) => i.type === "drink").length,
        foodCategories: categories.filter((c) => c.type === "food").length,
        foodItems: items.filter((i) => i.type === "food").length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <MenuPageSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gestion du Menu</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble et accès rapide aux catégories et items du menu
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Catégories</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              {stats.drinkCategories} boissons, {stats.foodCategories} nourriture
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <PackageOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              {stats.drinkItems} boissons, {stats.foodItems} nourriture
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Boissons</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drinkItems}</div>
            <p className="text-xs text-muted-foreground">
              dans {stats.drinkCategories} catégories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nourriture</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.foodItems}</div>
            <p className="text-xs text-muted-foreground">
              dans {stats.foodCategories} catégories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Drinks Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Coffee className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Boissons</CardTitle>
                  <CardDescription>
                    Gérer les catégories et items de boissons
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Catégories</span>
                <span className="font-semibold">{stats.drinkCategories}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items</span>
                <span className="font-semibold">{stats.drinkItems}</span>
              </div>
              <Link href="/admin/menu/drinks">
                <Button className="w-full">
                  Gérer les boissons
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Food Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UtensilsCrossed className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Nourriture</CardTitle>
                  <CardDescription>
                    Gérer les catégories et items de nourriture
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Catégories</span>
                <span className="font-semibold">{stats.foodCategories}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items</span>
                <span className="font-semibold">{stats.foodItems}</span>
              </div>
              <Link href="/admin/menu/food">
                <Button className="w-full">
                  Gérer la nourriture
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">À propos de la gestion du menu</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="space-y-2">
            <li>• Créez et organisez vos catégories de menu (boissons et nourriture)</li>
            <li>• Ajoutez des items avec descriptions, images et recettes</li>
            <li>• Contrôlez la visibilité sur le site public</li>
            <li>• Gérez l'ordre d'affichage des catégories et items</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
