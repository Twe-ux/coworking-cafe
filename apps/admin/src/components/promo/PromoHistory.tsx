import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { PromoHistory } from '@/types/promo'

/**
 * Affiche l'historique des anciens codes promo désactivés
 *
 * @param history - Liste des anciens codes promo
 * @param maxItems - Nombre maximum d'items à afficher (par défaut: tous)
 */
interface PromoHistoryProps {
  history?: PromoHistory[]
  maxItems?: number
}

export function PromoHistory({ history = [], maxItems }: PromoHistoryProps) {
  const displayedHistory = maxItems ? history.slice(0, maxItems) : history

  if (history.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Historique des codes</h3>
        <p className="text-sm text-gray-500 text-center py-8">Aucun code désactivé pour le moment</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Historique des codes</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-center">Utilisations</TableHead>
            <TableHead className="text-right">Désactivé le</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedHistory.map((item) => (
            <TableRow key={item.token}>
              <TableCell className="font-medium">{item.code}</TableCell>
              <TableCell className="text-sm text-gray-600">{item.description}</TableCell>
              <TableCell className="text-center">
                <span className="px-2 py-1 bg-gray-100 rounded-md text-sm font-medium">{item.totalUses}</span>
              </TableCell>
              <TableCell className="text-right text-sm text-gray-500">{item.deactivatedAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {maxItems && history.length > maxItems && (
        <p className="text-xs text-gray-500 text-center mt-4">
          Affichage de {maxItems} sur {history.length} codes
        </p>
      )}
    </Card>
  )
}
