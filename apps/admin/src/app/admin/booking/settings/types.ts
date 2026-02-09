export interface CancellationPolicyTier {
  daysBeforeBooking: number
  chargePercentage: number
}

export interface BookingSettings {
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

export const defaultSettings: BookingSettings = {
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
  notificationEmail: process.env.CONTACT_EMAIL || "strasbourg@coworkingcafe.fr",
}

export const spaceTypeOptions = [
  { value: "open-space", label: "Open-space" },
  { value: "salle-verriere", label: "Salle Verrière" },
  { value: "salle-etage", label: "Salle Étage" },
  { value: "evenementiel", label: "Événementiel" },
]
