import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectDB } from "@/lib/db"
import { Booking } from "@coworking-cafe/database"
import type { Booking as BookingType, ReservationType } from "@/types/booking"

/**
 * Infer reservation type based on space type and time data
 * - If reservationType exists in DB, use it
 * - For salle-etage and evenementiel: default to 'daily' (typically full-day)
 * - For open-space and salle-verriere with startTime: check duration
 * - Otherwise default to 'hourly'
 */
function inferReservationType(
  dbReservationType: string | undefined,
  spaceType: string,
  startTime?: string,
  endTime?: string
): ReservationType {
  // If already defined in DB, use it
  if (dbReservationType && ['hourly', 'daily', 'weekly', 'monthly'].includes(dbReservationType)) {
    return dbReservationType as ReservationType
  }

  // Spaces that are typically booked for full days
  const dailySpaces = ['salle-etage', 'evenementiel']
  if (dailySpaces.includes(spaceType)) {
    return 'daily'
  }

  // If we have time data, check duration to infer type
  if (startTime && endTime) {
    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)
    const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM)

    // If duration > 5 hours, it's a daily rate
    if (durationMinutes > 300) {
      return 'daily'
    }
  }

  // Default to hourly
  return 'hourly'
}

// GET /api/booking/reservations - Récupérer toutes les réservations
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["dev", "admin", "staff"])
    if (!authResult.authorized) {
      return authResult.response
    }

    await connectDB()

    // Filtres optionnels
    const searchParams = request.nextUrl.searchParams
    const spaceId = searchParams.get("spaceId")
    const clientId = searchParams.get("clientId")
    const status = searchParams.get("status")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const filter: Record<string, unknown> = {}

    if (spaceId) filter.space = spaceId
    if (clientId) filter.user = clientId
    if (status) filter.status = status
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) }
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ date: -1 })
      .lean()

    const data: BookingType[] = bookings.map((booking: any) => {
      const user = booking.user || {}
      // Priority: user name > contactName > email > fallback
      const clientName = (user.firstName && user.lastName)
        ? `${user.firstName} ${user.lastName}`
        : booking.contactName || user.email || booking.contactEmail || 'Client inconnu'

      return {
        _id: booking._id.toString(),
        spaceId: booking.space?.toString() || booking._id.toString(),
        spaceName: booking.spaceType || 'Espace',
        clientId: booking.user?._id?.toString() || booking.user?.toString() || '',
        clientName,
        clientEmail: user.email || booking.contactEmail || '',
        clientPhone: user.phone || booking.contactPhone || '',
        reservationType: inferReservationType(
          booking.reservationType,
          booking.spaceType,
          booking.startTime,
          booking.endTime
        ),
        startDate: booking.date.toISOString().split("T")[0],
        endDate: booking.date.toISOString().split("T")[0],
        startTime: booking.startTime || '',
        endTime: booking.endTime || '',
        numberOfPeople: booking.numberOfPeople,
        status: booking.status,
        totalPrice: booking.totalPrice,
        depositPaid: booking.amountPaid || 0,
        captureMethod: booking.captureMethod,
        depositAmount: booking.depositAmount,
        notes: booking.notes || booking.message || '',
        createdAt: booking.createdAt?.toISOString(),
        updatedAt: booking.updatedAt?.toISOString(),
        cancelledAt: booking.cancelledAt?.toISOString(),
        cancelReason: booking.cancelReason,
      }
    })

    return successResponse(data)
  } catch (error) {
    console.error("GET /api/booking/reservations error:", error)
    return errorResponse("Failed to fetch bookings", undefined, 500)
  }
}

// POST /api/booking/reservations - Créer une nouvelle réservation
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["dev", "admin"])
    if (!authResult.authorized) {
      return authResult.response
    }

    await connectDB()

    const body = await request.json()

    // Validation
    if (
      !body.spaceType ||
      !body.userId ||
      !body.date ||
      !body.numberOfPeople ||
      body.totalPrice === undefined
    ) {
      return errorResponse(
        "Missing required fields",
        "spaceType, userId, date, numberOfPeople, totalPrice are required",
        400
      )
    }

    // Créer la réservation
    const booking = await Booking.create({
      user: body.userId,
      space: body.spaceId,
      spaceType: body.spaceType,
      date: new Date(body.date),
      startTime: body.startTime,
      endTime: body.endTime,
      numberOfPeople: body.numberOfPeople,
      status: body.status || "pending",
      basePrice: body.basePrice || body.totalPrice,
      servicesPrice: 0,
      totalPrice: body.totalPrice,
      reservationType: body.reservationType || "hourly",
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      notes: body.notes,
      requiresPayment: true,
      paymentStatus: "unpaid",
      amountPaid: body.depositPaid || 0,
      additionalServices: [],
    })

    // Populate user pour retourner les données
    await booking.populate('user', 'firstName lastName email')
    const populatedBooking: any = booking.toObject()
    const user = populatedBooking.user || {}
    const clientName = user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email || 'Client inconnu'

    const data: BookingType = {
      _id: booking._id.toString(),
      spaceId: booking.space?.toString() || booking._id.toString(),
      spaceName: booking.spaceType,
      clientId: booking.user.toString(),
      clientName,
      clientEmail: user.email || booking.contactEmail || '',
      reservationType: inferReservationType(
        booking.reservationType,
        booking.spaceType,
        booking.startTime,
        booking.endTime
      ),
      startDate: booking.date.toISOString().split("T")[0],
      endDate: booking.date.toISOString().split("T")[0],
      startTime: booking.startTime || '',
      endTime: booking.endTime || '',
      numberOfPeople: booking.numberOfPeople,
      status: booking.status,
      totalPrice: booking.totalPrice,
      depositPaid: booking.amountPaid || 0,
      captureMethod: booking.captureMethod,
      depositAmount: booking.depositAmount,
      notes: booking.notes || '',
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    }

    return successResponse(data, "Booking created successfully", 201)
  } catch (error) {
    console.error("POST /api/booking/reservations error:", error)
    return errorResponse("Failed to create booking", undefined, 500)
  }
}
