import type { BookingSettings, CancellationPolicyTier } from "../types"

export function updateCancellationPolicyHelper(
  settings: BookingSettings,
  policyType: "openSpace" | "meetingRooms",
  index: number,
  field: keyof CancellationPolicyTier,
  value: number
): BookingSettings {
  const key =
    policyType === "openSpace"
      ? "cancellationPolicyOpenSpace"
      : "cancellationPolicyMeetingRooms"
  const updated = [...(settings[key] || [])]
  updated[index] = { ...updated[index], [field]: value }
  return { ...settings, [key]: updated }
}

export function addCancellationTierHelper(
  settings: BookingSettings,
  policyType: "openSpace" | "meetingRooms"
): BookingSettings {
  const key =
    policyType === "openSpace"
      ? "cancellationPolicyOpenSpace"
      : "cancellationPolicyMeetingRooms"
  return {
    ...settings,
    [key]: [
      ...(settings[key] || []),
      { daysBeforeBooking: 5, chargePercentage: 75 },
    ],
  }
}

export function removeCancellationTierHelper(
  settings: BookingSettings,
  policyType: "openSpace" | "meetingRooms",
  index: number
): BookingSettings {
  const key =
    policyType === "openSpace"
      ? "cancellationPolicyOpenSpace"
      : "cancellationPolicyMeetingRooms"
  return {
    ...settings,
    [key]: (settings[key] || []).filter((_, i) => i !== index),
  }
}

export function toggleSpaceTypeHelper(
  settings: BookingSettings,
  spaceType: string,
  checked: boolean
): BookingSettings {
  const current = settings.depositPolicy.applyToSpaces || []
  const updated = checked
    ? [...current, spaceType]
    : current.filter((s) => s !== spaceType)
  return {
    ...settings,
    depositPolicy: {
      ...settings.depositPolicy,
      applyToSpaces: updated,
    },
  }
}
