"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StyledAlert } from "@/components/ui/styled-alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Clock,
  Mail,
  Euro,
  XCircle,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Loader2,
} from "lucide-react"

interface CancellationPolicyTier {
  daysBeforeBooking: number
  chargePercentage: number
}

interface BookingSettings {
  _id?: string
  cancellationPolicyOpenSpace: CancellationPolicyTier[]
  cancellationPolicyMeetingRooms: CancellationPolicyTier[]
  cronSchedules: {
    attendanceCheckTime: string
    dailyReportTime: string
  }
  depositPolicy: {
    minAmountRequired: number
    defaultPercent: number
    applyToSpaces: string[]
  }
  notificationEmail: string
}

const defaultSettings: BookingSettings = {
  cancellationPolicyOpenSpace: [
    { daysBeforeBooking: 7, chargePercentage: 0 },
    { daysBeforeBooking: 3, chargePercentage: 50 },
    { daysBeforeBooking: 0, chargePercentage: 100 },
  ],
  cancellationPolicyMeetingRooms: [
    { daysBeforeBooking: 7, chargePercentage: 0 },
    { daysBeforeBooking: 3, chargePercentage: 50 },
    { daysBeforeBooking: 0, chargePercentage: 100 },
  ],
  cronSchedules: {
    attendanceCheckTime: "10:00",
    dailyReportTime: "19:00",
  },
  depositPolicy: {
    minAmountRequired: 200,
    defaultPercent: 50,
    applyToSpaces: ["salle-etage"],
  },
  notificationEmail: "strasbourg@coworkingcafe.fr",
}

const spaceTypeOptions = [
  { value: "open-space", label: "Open-space" },
  { value: "salle-verriere", label: "Salle Verrière" },
  { value: "salle-etage", label: "Salle Étage" },
  { value: "evenementiel", label: "Événementiel" },
]

export function BookingSettingsClient() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)
  const [settings, setSettings] = useState<BookingSettings>(defaultSettings)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/booking-settings")
      const data = await response.json()

      if (response.ok && !data.error) {
        setSettings({
          cancellationPolicyOpenSpace: data.cancellationPolicyOpenSpace || defaultSettings.cancellationPolicyOpenSpace,
          cancellationPolicyMeetingRooms: data.cancellationPolicyMeetingRooms || defaultSettings.cancellationPolicyMeetingRooms,
          cronSchedules: data.cronSchedules || defaultSettings.cronSchedules,
          depositPolicy: data.depositPolicy || defaultSettings.depositPolicy,
          notificationEmail: data.notificationEmail || defaultSettings.notificationEmail,
        })
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors du chargement",
        })
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors du chargement des réglages",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)

      const response = await fetch("/api/booking-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({
          type: "success",
          text: "Réglages enregistrés avec succès",
        })
        if (data.data) {
          setSettings(data.data)
        }
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors de l'enregistrement",
        })
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors de l'enregistrement des réglages",
      })
    } finally {
      setSaving(false)
    }
  }

  const addCancellationTier = (
    policyType: "openSpace" | "meetingRooms"
  ) => {
    const key =
      policyType === "openSpace"
        ? "cancellationPolicyOpenSpace"
        : "cancellationPolicyMeetingRooms"
    setSettings({
      ...settings,
      [key]: [
        ...(settings[key] || []),
        { daysBeforeBooking: 5, chargePercentage: 75 },
      ],
    })
  }

  const removeCancellationTier = (
    policyType: "openSpace" | "meetingRooms",
    index: number
  ) => {
    const key =
      policyType === "openSpace"
        ? "cancellationPolicyOpenSpace"
        : "cancellationPolicyMeetingRooms"
    setSettings({
      ...settings,
      [key]: (settings[key] || []).filter((_, i) => i !== index),
    })
  }

  const updateCancellationTier = (
    policyType: "openSpace" | "meetingRooms",
    index: number,
    field: keyof CancellationPolicyTier,
    value: number
  ) => {
    const key =
      policyType === "openSpace"
        ? "cancellationPolicyOpenSpace"
        : "cancellationPolicyMeetingRooms"
    const updated = [...(settings[key] || [])]
    updated[index] = { ...updated[index], [field]: value }
    setSettings({ ...settings, [key]: updated })
  }

  const toggleSpaceType = (spaceType: string, checked: boolean) => {
    const current = settings.depositPolicy.applyToSpaces || []
    const updated = checked
      ? [...current, spaceType]
      : current.filter((s) => s !== spaceType)
    setSettings({
      ...settings,
      depositPolicy: {
        ...settings.depositPolicy,
        applyToSpaces: updated,
      },
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Réglages Réservations</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSettings} disabled={saving}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Enregistrer
          </Button>
        </div>
      </div>

      {message && (
        <StyledAlert variant={message.type === "success" ? "success" : "destructive"}>
          {message.text}
        </StyledAlert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Politique d'annulation Open-Space */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Annulation Open-Space
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Politique d'annulation pour les places en open-space
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jours avant</TableHead>
                  <TableHead>% encaissé</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(settings.cancellationPolicyOpenSpace || []).map(
                  (tier, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={tier.daysBeforeBooking}
                          onChange={(e) =>
                            updateCancellationTier(
                              "openSpace",
                              index,
                              "daysBeforeBooking",
                              parseInt(e.target.value) || 0
                            )
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
                            updateCancellationTier(
                              "openSpace",
                              index,
                              "chargePercentage",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            removeCancellationTier("openSpace", index)
                          }
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => addCancellationTier("openSpace")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un palier
            </Button>
          </CardContent>
        </Card>

        {/* Politique d'annulation Salles de Réunion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Annulation Salles de Réunion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Politique d'annulation pour les salles de réunion
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jours avant</TableHead>
                  <TableHead>% encaissé</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(settings.cancellationPolicyMeetingRooms || []).map(
                  (tier, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={tier.daysBeforeBooking}
                          onChange={(e) =>
                            updateCancellationTier(
                              "meetingRooms",
                              index,
                              "daysBeforeBooking",
                              parseInt(e.target.value) || 0
                            )
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
                            updateCancellationTier(
                              "meetingRooms",
                              index,
                              "chargePercentage",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            removeCancellationTier("meetingRooms", index)
                          }
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => addCancellationTier("meetingRooms")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un palier
            </Button>
          </CardContent>
        </Card>

        {/* Horaires Automatisations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Automatisations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="attendanceCheckTime">
                Vérification présence (réservations J-1)
              </Label>
              <Input
                id="attendanceCheckTime"
                type="time"
                value={settings.cronSchedules.attendanceCheckTime}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    cronSchedules: {
                      ...settings.cronSchedules,
                      attendanceCheckTime: e.target.value,
                    },
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Heure de vérification automatique des présences
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyReportTime">
                Email récapitulatif quotidien
              </Label>
              <Input
                id="dailyReportTime"
                type="time"
                value={settings.cronSchedules.dailyReportTime}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    cronSchedules: {
                      ...settings.cronSchedules,
                      dailyReportTime: e.target.value,
                    },
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Heure d'envoi du récapitulatif des réservations
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Email de notification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notificationEmail">Email de destination</Label>
              <Input
                id="notificationEmail"
                type="email"
                value={settings.notificationEmail}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notificationEmail: e.target.value,
                  })
                }
                placeholder="strasbourg@coworkingcafe.fr"
              />
              <p className="text-xs text-muted-foreground">
                Email pour recevoir les rapports quotidiens
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Politique d'accompte */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="w-5 h-5" />
              Politique d'acompte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="minAmountRequired">
                  Montant minimum requis (€)
                </Label>
                <Input
                  id="minAmountRequired"
                  type="number"
                  min={0}
                  value={settings.depositPolicy.minAmountRequired}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      depositPolicy: {
                        ...settings.depositPolicy,
                        minAmountRequired: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Réservations au-delà nécessitent un acompte
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultPercent">
                  Pourcentage par défaut (%)
                </Label>
                <Input
                  id="defaultPercent"
                  type="number"
                  min={0}
                  max={100}
                  value={settings.depositPolicy.defaultPercent}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      depositPolicy: {
                        ...settings.depositPolicy,
                        defaultPercent: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Montant de l'acompte suggéré
                </p>
              </div>

              <div className="space-y-2">
                <Label>Espaces concernés</Label>
                <div className="space-y-2">
                  {spaceTypeOptions.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`space-${option.value}`}
                        checked={(
                          settings.depositPolicy.applyToSpaces || []
                        ).includes(option.value)}
                        onCheckedChange={(checked) =>
                          toggleSpaceType(option.value, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`space-${option.value}`}
                        className="font-normal"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Types d'espaces nécessitant un acompte
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
