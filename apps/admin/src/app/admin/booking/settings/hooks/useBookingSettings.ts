import { useEffect, useState } from "react"
import type { BookingSettings, CancellationPolicyTier } from "../types"
import { defaultSettings } from "../types"
import {
  addCancellationTierHelper,
  removeCancellationTierHelper,
  updateCancellationPolicyHelper,
  toggleSpaceTypeHelper,
} from "./settingsHelpers"

interface UseBookingSettingsReturn {
  loading: boolean
  saving: boolean
  message: { type: "success" | "error"; text: string } | null
  settings: BookingSettings
  setMessage: (message: { type: "success" | "error"; text: string } | null) => void
  fetchSettings: () => Promise<void>
  handleSave: () => Promise<void>
  addCancellationTier: (policyType: "openSpace" | "meetingRooms") => void
  removeCancellationTier: (policyType: "openSpace" | "meetingRooms", index: number) => void
  updateCancellationTier: (
    policyType: "openSpace" | "meetingRooms",
    index: number,
    field: keyof CancellationPolicyTier,
    value: number
  ) => void
  toggleSpaceType: (spaceType: string, checked: boolean) => void
  updateCronSchedule: (field: "attendanceCheckTime" | "dailyReportTime", value: string) => void
  updateDepositPolicy: (field: "minAmountRequired" | "defaultPercent", value: number) => void
  updateNotificationEmail: (value: string) => void
}

export function useBookingSettings(): UseBookingSettingsReturn {
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
          cancellationPolicyOpenSpace:
            data.cancellationPolicyOpenSpace || defaultSettings.cancellationPolicyOpenSpace,
          cancellationPolicyMeetingRooms:
            data.cancellationPolicyMeetingRooms || defaultSettings.cancellationPolicyMeetingRooms,
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

  const addCancellationTier = (policyType: "openSpace" | "meetingRooms") => {
    setSettings((prev) => addCancellationTierHelper(prev, policyType))
  }

  const removeCancellationTier = (
    policyType: "openSpace" | "meetingRooms",
    index: number
  ) => {
    setSettings((prev) => removeCancellationTierHelper(prev, policyType, index))
  }

  const updateCancellationTier = (
    policyType: "openSpace" | "meetingRooms",
    index: number,
    field: keyof CancellationPolicyTier,
    value: number
  ) => {
    setSettings((prev) => updateCancellationPolicyHelper(prev, policyType, index, field, value))
  }

  const toggleSpaceType = (spaceType: string, checked: boolean) => {
    setSettings((prev) => toggleSpaceTypeHelper(prev, spaceType, checked))
  }

  const updateCronSchedule = (
    field: "attendanceCheckTime" | "dailyReportTime",
    value: string
  ) => {
    setSettings({
      ...settings,
      cronSchedules: {
        ...settings.cronSchedules,
        [field]: value,
      },
    })
  }

  const updateDepositPolicy = (
    field: "minAmountRequired" | "defaultPercent",
    value: number
  ) => {
    setSettings({
      ...settings,
      depositPolicy: {
        ...settings.depositPolicy,
        [field]: value,
      },
    })
  }

  const updateNotificationEmail = (value: string) => {
    setSettings({
      ...settings,
      notificationEmail: value,
    })
  }

  return {
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
    updateCronSchedule,
    updateDepositPolicy,
    updateNotificationEmail,
  }
}
