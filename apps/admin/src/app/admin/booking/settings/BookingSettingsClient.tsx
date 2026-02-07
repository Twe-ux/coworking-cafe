"use client"

import { Button } from "@/components/ui/button"
import { StyledAlert } from "@/components/ui/styled-alert"
import { Loader2, RefreshCw, Save } from "lucide-react"
import { useBookingSettings } from "./hooks/useBookingSettings"
import { CancellationPolicyCard } from "./components/CancellationPolicyCard"
import { NotificationCard } from "./components/NotificationCard"
import { DepositPolicyCard } from "./components/DepositPolicyCard"

export function BookingSettingsClient() {
  const {
    loading,
    saving,
    message,
    settings,
    setMessage,
    fetchSettings,
    handleSave,
    addCancellationTier,
    removeCancellationTier,
    updateCancellationTier,
    toggleSpaceType,
    updateDepositPolicy,
    updateNotificationEmail,
  } = useBookingSettings()

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
        <CancellationPolicyCard
          title="Annulation Open-Space"
          description="Politique d'annulation pour les places en open-space"
          tiers={settings.cancellationPolicyOpenSpace}
          onAdd={() => addCancellationTier("openSpace")}
          onRemove={(index) => removeCancellationTier("openSpace", index)}
          onUpdate={(index, field, value) =>
            updateCancellationTier("openSpace", index, field, value)
          }
        />

        <CancellationPolicyCard
          title="Annulation Salles de Réunion"
          description="Politique d'annulation pour les salles de réunion"
          tiers={settings.cancellationPolicyMeetingRooms}
          onAdd={() => addCancellationTier("meetingRooms")}
          onRemove={(index) => removeCancellationTier("meetingRooms", index)}
          onUpdate={(index, field, value) =>
            updateCancellationTier("meetingRooms", index, field, value)
          }
        />

        <NotificationCard
          email={settings.notificationEmail}
          onUpdate={updateNotificationEmail}
        />

        <DepositPolicyCard
          minAmountRequired={settings.depositPolicy.minAmountRequired}
          defaultPercent={settings.depositPolicy.defaultPercent}
          applyToSpaces={settings.depositPolicy.applyToSpaces}
          onUpdateMinAmount={(value) => updateDepositPolicy("minAmountRequired", value)}
          onUpdatePercent={(value) => updateDepositPolicy("defaultPercent", value)}
          onToggleSpace={toggleSpaceType}
        />
      </div>
    </div>
  )
}
