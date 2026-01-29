import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { connectDB } from "@/lib/db"
import mongoose from "mongoose"

// BookingSettings Schema (matches apps/site/src/models/bookingSettings.ts)
interface CancellationPolicyTier {
  daysBeforeBooking: number
  chargePercentage: number
}

interface BookingSettingsData {
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

const BookingSettingsSchema = new mongoose.Schema(
  {
    cancellationPolicyOpenSpace: {
      type: [
        {
          daysBeforeBooking: { type: Number, required: true, min: 0 },
          chargePercentage: { type: Number, required: true, min: 0, max: 100 },
        },
      ],
      default: [
        { daysBeforeBooking: 7, chargePercentage: 0 },
        { daysBeforeBooking: 3, chargePercentage: 50 },
        { daysBeforeBooking: 0, chargePercentage: 100 },
      ],
    },
    cancellationPolicyMeetingRooms: {
      type: [
        {
          daysBeforeBooking: { type: Number, required: true, min: 0 },
          chargePercentage: { type: Number, required: true, min: 0, max: 100 },
        },
      ],
      default: [
        { daysBeforeBooking: 7, chargePercentage: 0 },
        { daysBeforeBooking: 3, chargePercentage: 50 },
        { daysBeforeBooking: 0, chargePercentage: 100 },
      ],
    },
    cronSchedules: {
      type: {
        attendanceCheckTime: { type: String, required: true, default: "10:00" },
        dailyReportTime: { type: String, required: true, default: "19:00" },
      },
      default: {
        attendanceCheckTime: "10:00",
        dailyReportTime: "19:00",
      },
    },
    depositPolicy: {
      type: {
        minAmountRequired: { type: Number, required: true, min: 0, default: 200 },
        defaultPercent: { type: Number, required: true, min: 0, max: 100, default: 50 },
        applyToSpaces: { type: [String], default: ["salle-etage"] },
      },
      default: {
        minAmountRequired: 200,
        defaultPercent: 50,
        applyToSpaces: ["salle-etage"],
      },
    },
    notificationEmail: {
      type: String,
      required: true,
      default: "strasbourg@coworkingcafe.fr",
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true, strict: false }
)

const BookingSettings =
  mongoose.models.BookingSettings ||
  mongoose.model("BookingSettings", BookingSettingsSchema)

const DEFAULT_SETTINGS: BookingSettingsData = {
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

// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET() {
  const authResult = await requireAuth(["dev", "admin"])
  if (!authResult.authorized) {
    return authResult.response
  }

  try {
    await connectDB()

    const settings = await BookingSettings.findOne()

    if (!settings) {
      return NextResponse.json(DEFAULT_SETTINGS)
    }

    return NextResponse.json({
      cancellationPolicyOpenSpace: settings.cancellationPolicyOpenSpace,
      cancellationPolicyMeetingRooms: settings.cancellationPolicyMeetingRooms,
      cronSchedules: settings.cronSchedules,
      depositPolicy: settings.depositPolicy,
      notificationEmail: settings.notificationEmail,
    })
  } catch (error) {
    console.error("GET /api/booking-settings error:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des paramètres" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(["dev", "admin"])
  if (!authResult.authorized) {
    return authResult.response
  }

  try {
    await connectDB()

    const body: BookingSettingsData = await request.json()

    // Validation
    if (!body.notificationEmail || !body.notificationEmail.includes("@")) {
      return NextResponse.json(
        { error: "Email de notification invalide" },
        { status: 400 }
      )
    }

    if (
      !body.cronSchedules?.attendanceCheckTime ||
      !body.cronSchedules?.dailyReportTime
    ) {
      return NextResponse.json(
        { error: "Horaires cron requis" },
        { status: 400 }
      )
    }

    // Upsert settings (create if not exists, update otherwise)
    const settings = await BookingSettings.findOneAndUpdate(
      {},
      {
        $set: {
          cancellationPolicyOpenSpace: body.cancellationPolicyOpenSpace,
          cancellationPolicyMeetingRooms: body.cancellationPolicyMeetingRooms,
          cronSchedules: body.cronSchedules,
          depositPolicy: body.depositPolicy,
          notificationEmail: body.notificationEmail.toLowerCase().trim(),
        },
      },
      { upsert: true, new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      message: "Paramètres enregistrés avec succès",
      data: {
        cancellationPolicyOpenSpace: settings.cancellationPolicyOpenSpace,
        cancellationPolicyMeetingRooms: settings.cancellationPolicyMeetingRooms,
        cronSchedules: settings.cronSchedules,
        depositPolicy: settings.depositPolicy,
        notificationEmail: settings.notificationEmail,
      },
    })
  } catch (error) {
    console.error("POST /api/booking-settings error:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement des paramètres" },
      { status: 500 }
    )
  }
}
