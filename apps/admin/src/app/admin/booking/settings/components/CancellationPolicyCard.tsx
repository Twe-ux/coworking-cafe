import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { XCircle, Plus, Trash2 } from "lucide-react"
import type { CancellationPolicyTier } from "../types"

interface CancellationPolicyCardProps {
  title: string
  description: string
  tiers: CancellationPolicyTier[]
  onAdd: () => void
  onRemove: (index: number) => void
  onUpdate: (index: number, field: keyof CancellationPolicyTier, value: number) => void
}

export function CancellationPolicyCard({
  title,
  description,
  tiers,
  onAdd,
  onRemove,
  onUpdate,
}: CancellationPolicyCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <XCircle className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jours avant</TableHead>
              <TableHead>% encaissé</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tiers.map((tier, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    value={tier.daysBeforeBooking}
                    onChange={(e) =>
                      onUpdate(index, "daysBeforeBooking", parseInt(e.target.value) || 0)
                    }
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={tier.chargePercentage}
                    onChange={(e) =>
                      onUpdate(index, "chargePercentage", parseInt(e.target.value) || 0)
                    }
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => onRemove(index)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button variant="outline" size="sm" className="mt-4" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un palier
        </Button>
      </CardContent>
    </Card>
  )
}
