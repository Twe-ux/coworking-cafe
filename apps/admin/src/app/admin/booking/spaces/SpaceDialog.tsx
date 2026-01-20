"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { SpaceConfiguration, SpaceType } from "@/types/booking"

interface SpaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  space?: SpaceConfiguration | null
  onSuccess: () => void
}

export function SpaceDialog({ open, onOpenChange, space, onSuccess }: SpaceDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    spaceType: "open-space" as SpaceType,
    slug: "",
    description: "",
    minCapacity: 1,
    maxCapacity: 10,
    pricing: {
      hourly: 0,
      daily: 0,
      weekly: 0,
      monthly: 0,
      perPerson: false,
    },
    availableReservationTypes: {
      hourly: true,
      daily: true,
      weekly: false,
      monthly: false,
    },
    requiresQuote: false,
    isActive: true,
    displayOrder: 0,
    features: [] as string[],
  })
  const [featuresInput, setFeaturesInput] = useState("")

  useEffect(() => {
    if (space) {
      setFormData({
        name: space.name,
        spaceType: space.spaceType,
        slug: space.slug,
        description: space.description || "",
        minCapacity: space.minCapacity,
        maxCapacity: space.maxCapacity,
        pricing: space.pricing,
        availableReservationTypes: space.availableReservationTypes,
        requiresQuote: space.requiresQuote,
        isActive: space.isActive,
        displayOrder: space.displayOrder,
        features: space.features || [],
      })
      setFeaturesInput((space.features || []).join(", "))
    } else {
      // Reset pour création
      setFormData({
        name: "",
        spaceType: "open-space",
        slug: "",
        description: "",
        minCapacity: 1,
        maxCapacity: 10,
        pricing: {
          hourly: 0,
          daily: 0,
          weekly: 0,
          monthly: 0,
          perPerson: false,
        },
        availableReservationTypes: {
          hourly: true,
          daily: true,
          weekly: false,
          monthly: false,
        },
        requiresQuote: false,
        isActive: true,
        displayOrder: 0,
        features: [],
      })
      setFeaturesInput("")
    }
  }, [space, open])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: generateSlug(value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Parser les features
      const features = featuresInput
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f.length > 0)

      const payload = {
        ...formData,
        features,
      }

      const url = space
        ? `/api/booking/spaces/${space._id}`
        : "/api/booking/spaces"
      const method = space ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
      } else {
        alert(data.error || "Erreur lors de l'enregistrement")
      }
    } catch (error) {
      alert("Erreur lors de l'enregistrement")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {space ? "Modifier l'espace" : "Nouvel espace"}
          </DialogTitle>
          <DialogDescription>
            Configuration des espaces réservables
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'espace *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (généré automatiquement)</Label>
              <Input id="slug" value={formData.slug} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="spaceType">Type d'espace *</Label>
              <Select
                value={formData.spaceType}
                onValueChange={(value: SpaceType) =>
                  setFormData((prev) => ({ ...prev, spaceType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open-space">Open Space</SelectItem>
                  <SelectItem value="salle-verriere">Salle Verrière</SelectItem>
                  <SelectItem value="salle-etage">Salle Étage</SelectItem>
                  <SelectItem value="evenementiel">Événementiel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minCapacity">Capacité minimale *</Label>
                <Input
                  id="minCapacity"
                  type="number"
                  min={1}
                  value={formData.minCapacity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      minCapacity: parseInt(e.target.value),
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxCapacity">Capacité maximale *</Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  min={1}
                  value={formData.maxCapacity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxCapacity: parseInt(e.target.value),
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Types de réservation disponibles</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hourly"
                    checked={formData.availableReservationTypes.hourly}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        availableReservationTypes: {
                          ...prev.availableReservationTypes,
                          hourly: checked === true,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="hourly" className="font-normal">
                    Horaire
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="daily"
                    checked={formData.availableReservationTypes.daily}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        availableReservationTypes: {
                          ...prev.availableReservationTypes,
                          daily: checked === true,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="daily" className="font-normal">
                    Journée
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="weekly"
                    checked={formData.availableReservationTypes.weekly}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        availableReservationTypes: {
                          ...prev.availableReservationTypes,
                          weekly: checked === true,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="weekly" className="font-normal">
                    Semaine
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="monthly"
                    checked={formData.availableReservationTypes.monthly}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        availableReservationTypes: {
                          ...prev.availableReservationTypes,
                          monthly: checked === true,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="monthly" className="font-normal">
                    Mois
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Tarifs (€)</Label>
              <div className="grid grid-cols-2 gap-4">
                {formData.availableReservationTypes.hourly && (
                  <div className="space-y-2">
                    <Label htmlFor="hourly-price">Tarif horaire</Label>
                    <Input
                      id="hourly-price"
                      type="number"
                      min={0}
                      step={0.01}
                      value={formData.pricing.hourly}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          pricing: {
                            ...prev.pricing,
                            hourly: parseFloat(e.target.value),
                          },
                        }))
                      }
                    />
                  </div>
                )}
                {formData.availableReservationTypes.daily && (
                  <div className="space-y-2">
                    <Label htmlFor="daily-price">Tarif journée</Label>
                    <Input
                      id="daily-price"
                      type="number"
                      min={0}
                      step={0.01}
                      value={formData.pricing.daily}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          pricing: {
                            ...prev.pricing,
                            daily: parseFloat(e.target.value),
                          },
                        }))
                      }
                    />
                  </div>
                )}
                {formData.availableReservationTypes.weekly && (
                  <div className="space-y-2">
                    <Label htmlFor="weekly-price">Tarif semaine</Label>
                    <Input
                      id="weekly-price"
                      type="number"
                      min={0}
                      step={0.01}
                      value={formData.pricing.weekly}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          pricing: {
                            ...prev.pricing,
                            weekly: parseFloat(e.target.value),
                          },
                        }))
                      }
                    />
                  </div>
                )}
                {formData.availableReservationTypes.monthly && (
                  <div className="space-y-2">
                    <Label htmlFor="monthly-price">Tarif mois</Label>
                    <Input
                      id="monthly-price"
                      type="number"
                      min={0}
                      step={0.01}
                      value={formData.pricing.monthly}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          pricing: {
                            ...prev.pricing,
                            monthly: parseFloat(e.target.value),
                          },
                        }))
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">
                Caractéristiques (séparées par des virgules)
              </Label>
              <Input
                id="features"
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
                placeholder="WiFi, Écran, Tableau blanc"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayOrder">Ordre d'affichage</Label>
              <Input
                id="displayOrder"
                type="number"
                min={0}
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    displayOrder: parseInt(e.target.value),
                  }))
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label htmlFor="isActive" className="font-normal">
                Espace actif
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="requiresQuote"
                checked={formData.requiresQuote}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, requiresQuote: checked }))
                }
              />
              <Label htmlFor="requiresQuote" className="font-normal">
                Nécessite un devis
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Enregistrement..."
                : space
                ? "Mettre à jour"
                : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
