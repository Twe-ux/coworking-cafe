"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, Plus, Edit, Trash2, AlertCircle, CheckCircle2 } from "lucide-react"
import { SpacesSkeleton } from "./SpacesSkeleton"
import { SpaceDialog } from "./SpaceDialog"
import type { SpaceConfiguration } from "@/types/booking"

export function SpacesClient() {
  const [spaces, setSpaces] = useState<SpaceConfiguration[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSpace, setSelectedSpace] = useState<SpaceConfiguration | null>(null)

  useEffect(() => {
    fetchSpaces()
  }, [])

  const fetchSpaces = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/booking/spaces")
      const data = await response.json()

      if (data.success) {
        setSpaces(data.data || [])
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors du chargement" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors du chargement des espaces" })
    } finally {
      setLoading(false)
    }
  }

  const getSpaceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "open-space": "Open Space",
      "salle-verriere": "Salle Verrière",
      "salle-etage": "Salle Étage",
      "evenementiel": "Événementiel",
    }
    return labels[type] || type
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price)
  }

  const handleCreate = () => {
    setSelectedSpace(null)
    setDialogOpen(true)
  }

  const handleEdit = (space: SpaceConfiguration) => {
    setSelectedSpace(space)
    setDialogOpen(true)
  }

  const handleDelete = async (spaceId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet espace ?")) {
      return
    }

    try {
      const response = await fetch(`/api/booking/spaces/${spaceId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "Espace supprimé avec succès" })
        fetchSpaces()
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors de la suppression" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de la suppression" })
    }
  }

  const handleDialogSuccess = () => {
    setMessage({ type: "success", text: selectedSpace ? "Espace mis à jour" : "Espace créé" })
    fetchSpaces()
  }

  if (loading) {
    return <SpacesSkeleton />
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="w-8 h-8" />
            Espaces de réunion
          </h1>
          <p className="text-muted-foreground mt-2">
            Configuration des espaces réservables
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel espace
        </Button>
      </div>

      <SpaceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        space={selectedSpace}
        onSuccess={handleDialogSuccess}
      />

      {message && (
        <Alert variant={message.type === "success" ? "default" : "destructive"}>
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {spaces.length === 0 ? (
        <Alert>
          <AlertDescription>
            Aucun espace configuré pour le moment.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {spaces.map((space) => (
            <Card key={space._id} className={space.isActive ? "" : "opacity-60"}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {space.name}
                      {!space.isActive && (
                        <Badge variant="secondary">Inactif</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {getSpaceTypeLabel(space.spaceType)}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {space.minCapacity}-{space.maxCapacity} pers.
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {space.description && (
                  <p className="text-sm text-muted-foreground">
                    {space.description}
                  </p>
                )}

                <div className="space-y-2">
                  {space.availableReservationTypes.hourly && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tarif horaire :</span>
                      <span className="font-medium">
                        {formatPrice(space.pricing.hourly)}
                      </span>
                    </div>
                  )}
                  {space.availableReservationTypes.daily && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tarif journée :</span>
                      <span className="font-medium">
                        {formatPrice(space.pricing.daily)}
                      </span>
                    </div>
                  )}
                  {space.availableReservationTypes.weekly && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tarif semaine :</span>
                      <span className="font-medium">
                        {formatPrice(space.pricing.weekly)}
                      </span>
                    </div>
                  )}
                  {space.availableReservationTypes.monthly && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tarif mois :</span>
                      <span className="font-medium">
                        {formatPrice(space.pricing.monthly)}
                      </span>
                    </div>
                  )}
                </div>

                {space.features && space.features.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {space.features.slice(0, 3).map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {space.features.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{space.features.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(space)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => space._id && handleDelete(space._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
