'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { OrderStatusBadge } from '@/components/inventory/orders'
import { useOrders } from '@/hooks/inventory/useOrders'
import type { OrderStatus } from '@/types/inventory'

export default function OrdersPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')

  const { orders, loading } = useOrders({
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">Commandes Fournisseurs</h1>
          <p className="text-muted-foreground mt-1">
            Créer et gérer les commandes fournisseurs
          </p>
        </div>
        <Button onClick={() => router.push('/admin/inventory/orders/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle commande
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="draft">Brouillons</SelectItem>
            <SelectItem value="validated">Validées</SelectItem>
            <SelectItem value="sent">Envoyées</SelectItem>
            <SelectItem value="received">Reçues</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des commandes</CardTitle>
          <CardDescription>
            {orders.length} commande{orders.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune commande trouvée
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Commande</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead className="text-center">Nb Produits</TableHead>
                  <TableHead className="text-right">Total TTC</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order._id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/admin/inventory/orders/${order._id}`)}
                  >
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.supplierName}</TableCell>
                    <TableCell className="text-center">{order.items.length}</TableCell>
                    <TableCell className="text-right">
                      {order.totalTTC.toFixed(2)} €
                    </TableCell>
                    <TableCell className="text-center">
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/admin/inventory/orders/${order._id}`)
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Voir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
