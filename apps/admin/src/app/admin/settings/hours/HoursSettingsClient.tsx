"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, Plus, Trash2, Save, AlertCircle, CheckCircle2 } from "lucide-react"
import { HoursSettingsSkeleton } from "./HoursSettingsSkeleton"
import type { GlobalHoursConfiguration, DayHours, ExceptionalClosure, WeeklyHours } from "@/types/settings"

const daysOfWeek = [
  { key: "monday" as const, label: "Lundi" },
  { key: "tuesday" as const, label: "Mardi" },
  { key: "wednesday" as const, label: "Mercredi" },
  { key: "thursday" as const, label: "Jeudi" },
  { key: "friday" as const, label: "Vendredi" },
  { key: "saturday" as const, label: "Samedi" },
  { key: "sunday" as const, label: "Dimanche" },
]

export function HoursSettingsClient() {
  const [configuration, setConfiguration] = useState<GlobalHoursConfiguration | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchConfiguration()
  }, [])

  const fetchConfiguration = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/settings/hours")
      const data = await response.json()

      if (data.success) {
        setConfiguration(data.data)
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors du chargement" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors du chargement des horaires" })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!configuration) return

    try {
      setSaving(true)
      setMessage(null)

      const response = await fetch("/api/settings/hours", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultHours: configuration.defaultHours,
          exceptionalClosures: configuration.exceptionalClosures,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "Horaires mis à jour avec succès" })
        setConfiguration(data.data)
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors de la mise à jour" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de la mise à jour" })
    } finally {
      setSaving(false)
    }
  }

  const updateDayHours = (day: keyof WeeklyHours, updates: Partial<DayHours>) => {
    if (!configuration) return

    const currentDayHours = configuration.defaultHours[day]

    setConfiguration({
      ...configuration,
      defaultHours: {
        ...configuration.defaultHours,
        [day]: {
          ...currentDayHours,
          ...updates,
        },
      },
    })
  }

  const addExceptionalClosure = () => {
    if (!configuration) return

    const today = new Date().toISOString().split("T")[0]

    setConfiguration({
      ...configuration,
      exceptionalClosures: [
        ...configuration.exceptionalClosures,
        {
          date: today,
          reason: "",
          isFullDay: true,
          startTime: "",
          endTime: "",
        },
      ],
    })
  }

  const removeExceptionalClosure = (index: number) => {
    if (!configuration) return

    setConfiguration({
      ...configuration,
      exceptionalClosures: configuration.exceptionalClosures.filter((_, i) => i !== index),
    })
  }

  const updateExceptionalClosure = (
    index: number,
    field: keyof ExceptionalClosure,
    value: string | boolean
  ) => {
    if (!configuration) return

    setConfiguration({
      ...configuration,
      exceptionalClosures: configuration.exceptionalClosures.map((closure, i) =>
        i === index ? { ...closure, [field]: value } : closure
      ),
    })
  }

  if (loading) {
    return <HoursSettingsSkeleton />
  }

  if (!configuration) {
    return (
      <div className="space-y-6 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Impossible de charger la configuration des horaires.
          </AlertDescription>
        </Alert>
        <Button onClick={fetchConfiguration}>Réessayer</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Clock className="w-8 h-8" />
            Horaires d'ouverture
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérer les horaires d'ouverture et fermetures exceptionnelles
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Horaires par défaut</CardTitle>
          <CardDescription>
            Définissez les horaires d'ouverture pour chaque jour de la semaine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {daysOfWeek.map((day) => {
            const dayHours = configuration.defaultHours[day.key]
            return (
              <div key={day.key} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-32">
                  <Label className="font-semibold">{day.label}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={dayHours.isOpen}
                    onCheckedChange={(checked) =>
                      updateDayHours(day.key, { isOpen: checked })
                    }
                  />
                  <Label className="text-sm text-muted-foreground">
                    {dayHours.isOpen ? "Ouvert" : "Fermé"}
                  </Label>
                </div>
                {dayHours.isOpen && (
                  <>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">De</Label>
                      <Input
                        type="time"
                        value={dayHours.openTime || ""}
                        onChange={(e) =>
                          updateDayHours(day.key, { openTime: e.target.value })
                        }
                        className="w-32"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">à</Label>
                      <Input
                        type="time"
                        value={dayHours.closeTime || ""}
                        onChange={(e) =>
                          updateDayHours(day.key, { closeTime: e.target.value })
                        }
                        className="w-32"
                      />
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fermetures exceptionnelles</CardTitle>
          <CardDescription>
            Ajoutez les dates de fermeture (jours fériés, congés, événements)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {configuration.exceptionalClosures.length === 0 ? (
            <Alert>
              <AlertDescription>
                Aucune fermeture exceptionnelle programmée
              </AlertDescription>
            </Alert>
          ) : (
            configuration.exceptionalClosures.map((closure, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={closure.date}
                        onChange={(e) =>
                          updateExceptionalClosure(index, "date", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Raison</Label>
                      <Input
                        type="text"
                        placeholder="Ex: Jour férié"
                        value={closure.reason || ""}
                        onChange={(e) =>
                          updateExceptionalClosure(index, "reason", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeExceptionalClosure(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={closure.isFullDay}
                    onCheckedChange={(checked) =>
                      updateExceptionalClosure(index, "isFullDay", checked)
                    }
                  />
                  <Label className="text-sm">Fermeture toute la journée</Label>
                </div>

                {!closure.isFullDay && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Heure de début</Label>
                      <Input
                        type="time"
                        value={closure.startTime || ""}
                        onChange={(e) =>
                          updateExceptionalClosure(index, "startTime", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Heure de fin</Label>
                      <Input
                        type="time"
                        value={closure.endTime || ""}
                        onChange={(e) =>
                          updateExceptionalClosure(index, "endTime", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          <Button variant="outline" onClick={addExceptionalClosure} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une fermeture
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
