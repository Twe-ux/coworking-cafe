import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface OrderSummarySimpleProps {
  totalHT: number
  totalTTC: number
  itemCount?: number
  createdAt?: string
  sentAt?: string
  receivedAt?: string
}

export function OrderSummarySimple({
  totalHT,
  totalTTC,
  itemCount,
  createdAt,
  sentAt,
  receivedAt
}: OrderSummarySimpleProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Résumé de la commande</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Dates Section */}
        {(createdAt || sentAt || receivedAt) && (
          <>
            {createdAt && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date de commande</span>
                <span className="font-medium">{formatDate(createdAt)}</span>
              </div>
            )}
            {sentAt && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date d'envoi</span>
                <span className="font-medium">{formatDate(sentAt)}</span>
              </div>
            )}
            {receivedAt && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date de réception</span>
                <span className="font-medium">{formatDate(receivedAt)}</span>
              </div>
            )}
            <div className="border-t my-2"></div>
          </>
        )}

        {/* Totals Section */}
        {itemCount !== undefined && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nombre de produits</span>
            <span className="font-medium">{itemCount}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total HT</span>
          <span className="font-medium">{totalHT.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Total TTC</span>
          <span>{totalTTC.toFixed(2)} €</span>
        </div>
      </CardContent>
    </Card>
  )
}
