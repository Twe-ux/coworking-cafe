'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Package,
  Truck,
  ClipboardList,
  ShoppingCart,
  BarChart3,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useInventoryKpis } from '@/hooks/inventory/useInventoryKpis'
import { useInventoryTasks } from '@/hooks/inventory/useInventoryTasks'
import { PendingTasksBanner } from '@/components/inventory/tasks/PendingTasksBanner'

const sections = [
  {
    title: 'Fournisseurs',
    description: 'Gerer les fournisseurs et leurs coordonnees',
    icon: Truck,
    href: '/admin/inventory/suppliers',
  },
  {
    title: 'Produits',
    description: 'Catalogue de produits, prix et niveaux de stock',
    icon: Package,
    href: '/admin/inventory/products',
  },
  {
    title: 'Inventaires',
    description: 'Saisir et consulter les inventaires hebdomadaires/mensuels',
    icon: ClipboardList,
    href: '/admin/inventory/entries',
  },
  {
    title: 'Commandes',
    description: 'Gerer les commandes fournisseurs et receptions',
    icon: ShoppingCart,
    href: '/admin/inventory/orders',
  },
  {
    title: 'Analytics',
    description: 'Tableaux de bord, valeur stock, tendances consommation',
    icon: BarChart3,
    href: '/admin/inventory/analytics',
  },
]

export default function InventoryPage() {
  const router = useRouter()
  const { totalProducts, stockValue, lowStockCount, loading: kpiLoading } =
    useInventoryKpis()
  const { pendingTasks, loading: tasksLoading } = useInventoryTasks()

  const handleStartFromTask = (taskId: string, type: 'weekly' | 'monthly') => {
    router.push(`/admin/inventory/new?taskId=${taskId}&type=${type}`)
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des Stocks</h1>
        <p className="text-muted-foreground mt-2">
          Fournisseurs, produits, inventaires, commandes et analytics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produits actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {kpiLoading ? '...' : totalProducts}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valeur du stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {kpiLoading ? '...' : `${stockValue.toFixed(0)} \u20AC`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alertes stock bas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold flex items-center gap-2 ${lowStockCount > 0 ? 'text-destructive' : ''}`}>
              {kpiLoading ? '...' : lowStockCount}
              {!kpiLoading && lowStockCount > 0 && (
                <AlertTriangle className="h-6 w-6" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending inventory tasks */}
      {!tasksLoading && pendingTasks.length > 0 && (
        <PendingTasksBanner
          tasks={pendingTasks}
          onStartInventory={handleStartFromTask}
        />
      )}

      {/* Section cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <section.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
