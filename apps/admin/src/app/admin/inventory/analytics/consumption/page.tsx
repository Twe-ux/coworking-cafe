'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { TrendingDown, TrendingUp, Package, Euro } from 'lucide-react'

interface TopProduct {
  rank: number
  productId: string
  productName: string
  totalQuantityConsumed: number
  avgCUMP: number
  totalValue: number
}

interface AnalyticsData {
  totalValue: number
  topProducts: TopProduct[]
  monthlyTrend: { month: number; value: number }[]
  inventoryCount: number
}

function generateYearOptions() {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 3 }, (_, i) => currentYear - i)
}

function generateMonthOptions() {
  return [
    { value: 'all', label: 'Toute l\'année' },
    { value: '1', label: 'Janvier' },
    { value: '2', label: 'Février' },
    { value: '3', label: 'Mars' },
    { value: '4', label: 'Avril' },
    { value: '5', label: 'Mai' },
    { value: '6', label: 'Juin' },
    { value: '7', label: 'Juillet' },
    { value: '8', label: 'Août' },
    { value: '9', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' },
  ]
}

export default function ConsumptionAnalyticsPage() {
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString())
  const [monthFilter, setMonthFilter] = useState('all')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const yearOptions = generateYearOptions()
  const monthOptions = generateMonthOptions()

  useEffect(() => {
    fetchAnalytics()
  }, [yearFilter, monthFilter])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ year: yearFilter })
      if (monthFilter !== 'all') {
        params.append('month', monthFilter)
      }

      const res = await fetch(`/api/inventory/analytics/consumption?${params}`)
      const result = await res.json()

      if (result.success && result.data) {
        setData(result.data)
      } else {
        setError(result.error || 'Erreur lors du chargement')
      }
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  const topProduct = data?.topProducts?.[0]
  const previousMonthValue = data?.monthlyTrend?.[new Date().getMonth() - 1]?.value || 0
  const currentMonthValue = data?.monthlyTrend?.[new Date().getMonth()]?.value || 0
  const evolution = previousMonthValue > 0
    ? ((currentMonthValue - previousMonthValue) / previousMonthValue) * 100
    : 0

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics Consommation</h1>
        <p className="text-muted-foreground mt-1">
          Analyse de la consommation valorisée avec CUMP
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Année" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Mois" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Value */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                  <Euro className="h-4 w-4" />
                  Valeur Totale Consommée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">
                  {data.totalValue.toFixed(2)} €
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  {data.inventoryCount} inventaire{data.inventoryCount > 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            {/* Top Product */}
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Produit le Plus Consommé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-base font-bold text-green-900">
                  {topProduct ? topProduct.productName : 'N/A'}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  {topProduct ? `${topProduct.totalValue.toFixed(2)} €` : '-'}
                </p>
              </CardContent>
            </Card>

            {/* Evolution */}
            <Card className="border-gray-200 bg-gray-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  {evolution >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  )}
                  Évolution vs Mois Précédent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${evolution >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {evolution >= 0 ? '+' : ''}{evolution.toFixed(1)}%
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {monthFilter === 'all' ? 'Moyenne annuelle' : 'Vs mois précédent'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Produits Consommés</CardTitle>
            </CardHeader>
            <CardContent>
              {data.topProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucune consommation pour cette période
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rang</TableHead>
                        <TableHead>Produit</TableHead>
                        <TableHead className="text-right">Quantité</TableHead>
                        <TableHead className="text-right">CUMP Moyen</TableHead>
                        <TableHead className="text-right">Valeur Totale</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.topProducts.map((product) => (
                        <TableRow key={product.productId}>
                          <TableCell className="font-medium">#{product.rank}</TableCell>
                          <TableCell>{product.productName}</TableCell>
                          <TableCell className="text-right">{product.totalQuantityConsumed}</TableCell>
                          <TableCell className="text-right">{product.avgCUMP.toFixed(2)} €</TableCell>
                          <TableCell className="text-right font-semibold">
                            {product.totalValue.toFixed(2)} €
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
