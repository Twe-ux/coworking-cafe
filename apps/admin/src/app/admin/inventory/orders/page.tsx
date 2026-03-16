'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Eye, ShoppingBag, ShoppingCart, CheckCircle2, Send, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { OrderStatusBadge } from '@/components/inventory/orders'
import { DirectPurchaseList } from '@/components/inventory/direct-purchases'
import { useOrders } from '@/hooks/inventory/useOrders'
import type { OrderStatus, DirectPurchase, APIResponse } from '@/types/inventory'
import { cn } from '@/lib/utils'

const STATUS_CARDS = [
  {
    value: 'draft' as OrderStatus,
    label: 'En attente',
    description: 'Commandes à valider',
    icon: ShoppingCart,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    value: 'sent' as OrderStatus,
    label: 'Envoyées',
    description: 'Validées et envoyées',
    icon: Send,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    value: 'received' as OrderStatus,
    label: 'Reçues',
    description: 'Livrées et stockées',
    icon: Package,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
]

export default function OrdersPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('draft')
  const [directPurchases, setDirectPurchases] = useState<DirectPurchase[]>([])
  const [loadingPurchases, setLoadingPurchases] = useState(true)

  // Load all orders once and filter client-side to avoid flash
  const { orders: allOrders, loading } = useOrders({})

  // Fetch direct purchases
  const fetchDirectPurchases = async () => {
    setLoadingPurchases(true)
    try {
      const res = await fetch('/api/inventory/direct-purchases')
      const data = (await res.json()) as APIResponse<DirectPurchase[]>
      if (data.success && data.data) {
        setDirectPurchases(data.data)
      }
    } catch (err) {
      console.error('Error fetching direct purchases:', err)
    } finally {
      setLoadingPurchases(false)
    }
  }

  useEffect(() => {
    fetchDirectPurchases()
  }, [])

  // Filter orders by selected status
  // Note: 'validated' orders are shown in 'sent' category (legacy support)
  const orders = allOrders.filter((order) => {
    if (statusFilter === 'sent') {
      // Show both 'sent' and 'validated' in "Envoyées" category
      return order.status === 'sent' || order.status === 'validated'
    }
    return order.status === statusFilter
  })

  const selectedCard = STATUS_CARDS.find((c) => c.value === statusFilter)

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
            onClick={() => router.push('/admin/inventory/direct-purchases/new')}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Achat Direct
          </Button>
          <Button
            variant="outline"
            className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
            onClick={() => router.push('/admin/inventory/orders/new')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle commande
          </Button>
        </div>
      </div>

      {/* Status Filter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATUS_CARDS.map((card) => {
          const Icon = card.icon
          const isSelected = statusFilter === card.value
          // Count orders: 'sent' card includes both 'sent' and 'validated' (legacy)
          const count = card.value === 'sent'
            ? allOrders.filter((o) => o.status === 'sent' || o.status === 'validated').length
            : allOrders.filter((o) => o.status === card.value).length
          const isDraftCard = card.value === 'draft'
          const showRedBadge = isDraftCard && count > 0

          return (
            <Card
              key={card.value}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                isSelected
                  ? `${card.bgColor} ${card.borderColor} border-2 shadow-md`
                  : 'hover:bg-muted/50'
              )}
              onClick={() => setStatusFilter(card.value)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Icon className={cn('h-5 w-5', isSelected ? card.color : 'text-muted-foreground')} />
                  {count > 0 && (
                    <Badge variant={showRedBadge ? 'destructive' : isSelected ? 'default' : 'secondary'}>
                      {count}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{card.label}</CardTitle>
                <CardDescription className="text-xs">
                  {card.description}
                </CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {selectedCard && <selectedCard.icon className={cn('h-5 w-5', selectedCard.color)} />}
            <CardTitle>{selectedCard?.label || 'Commandes'}</CardTitle>
          </div>
          <CardDescription>
            {orders.length} commande{orders.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune commande {selectedCard?.label.toLowerCase()} trouvée
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date de création</TableHead>
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
                    <TableCell className="font-medium">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
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
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/admin/inventory/orders/${order._id}`)
                        }}
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Direct Purchases Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-blue-600" />
            <CardTitle>Achats Directs</CardTitle>
          </div>
          <CardDescription>
            {directPurchases.length} achat{directPurchases.length > 1 ? 's' : ''} direct{directPurchases.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DirectPurchaseList
            purchases={directPurchases}
            loading={loadingPurchases}
            onRefresh={fetchDirectPurchases}
          />
        </CardContent>
      </Card>
    </div>
  )
}
