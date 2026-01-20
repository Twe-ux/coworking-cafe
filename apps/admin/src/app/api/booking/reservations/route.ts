import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectDB } from "@/lib/db"
import { Booking } from "@coworking-cafe/database"
import type { Booking as BookingType } from "@/types/booking"

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

    if (spaceId) filter.spaceId = spaceId
    if (clientId) filter.clientId = clientId
    if (status) filter.status = status
    if (startDate && endDate) {
      filter.startDate = { $lte: new Date(endDate) }
      filter.endDate = { $gte: new Date(startDate) }
    }

    const bookings = await Booking.find(filter).sort({ startDate: -1 }).lean()

    const data: BookingType[] = bookings.map((booking) => ({
      _id: booking._id.toString(),
      spaceId: booking.spaceId.toString(),
      spaceName: booking.spaceName,
      clientId: booking.clientId.toString(),
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      reservationType: booking.reservationType,
      startDate: booking.startDate.toISOString().split("T")[0],
      endDate: booking.endDate.toISOString().split("T")[0],
      startTime: booking.startTime,
      endTime: booking.endTime,
      numberOfPeople: booking.numberOfPeople,
      status: booking.status,
      totalPrice: booking.totalPrice,
      depositPaid: booking.depositPaid,
      notes: booking.notes,
      createdAt: booking.createdAt?.toISOString(),
      updatedAt: booking.updatedAt?.toISOString(),
      cancelledAt: booking.cancelledAt?.toISOString(),
      cancelReason: booking.cancelReason,
    }))

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
      !body.spaceId ||
      !body.clientId ||
      !body.reservationType ||
      !body.startDate ||
      !body.endDate ||
      !body.numberOfPeople ||
      body.totalPrice === undefined
    ) {
      return errorResponse(
        "Missing required fields",
        "spaceId, clientId, reservationType, startDate, endDate, numberOfPeople, totalPrice are required",
        400
      )
    }

    // Créer la réservation
    const booking = await Booking.create({
      spaceId: body.spaceId,
      spaceName: body.spaceName,
      clientId: body.clientId,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      reservationType: body.reservationType,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      startTime: body.startTime,
      endTime: body.endTime,
      numberOfPeople: body.numberOfPeople,
      status: body.status || "pending",
      totalPrice: body.totalPrice,
      depositPaid: body.depositPaid,
      notes: body.notes,
    })

    const data: BookingType = {
      _id: booking._id.toString(),
      spaceId: booking.spaceId.toString(),
      spaceName: booking.spaceName,
      clientId: booking.clientId.toString(),
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      reservationType: booking.reservationType,
      startDate: booking.startDate.toISOString().split("T")[0],
      endDate: booking.endDate.toISOString().split("T")[0],
      startTime: booking.startTime,
      endTime: booking.endTime,
      numberOfPeople: booking.numberOfPeople,
      status: booking.status,
      totalPrice: booking.totalPrice,
      depositPaid: booking.depositPaid,
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    }

    return successResponse(data, "Booking created successfully", 201)
  } catch (error) {
    console.error("POST /api/booking/reservations error:", error)
    return errorResponse("Failed to create booking", undefined, 500)
  }
}
