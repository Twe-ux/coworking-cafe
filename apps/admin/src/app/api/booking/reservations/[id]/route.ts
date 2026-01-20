import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectDB } from "@/lib/db"
import { Booking } from "@coworking-cafe/database"
import type { Booking as BookingType } from "@/types/booking"

// GET /api/booking/reservations/[id] - Récupérer une réservation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(["dev", "admin", "staff"])
    if (!authResult.authorized) {
      return authResult.response
    }

    await connectDB()

    const booking = await Booking.findById(params.id).lean()

    if (!booking) {
      return errorResponse("Booking not found", undefined, 404)
    }

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
      createdAt: booking.createdAt?.toISOString(),
      updatedAt: booking.updatedAt?.toISOString(),
      cancelledAt: booking.cancelledAt?.toISOString(),
      cancelReason: booking.cancelReason,
    }

    return successResponse(data)
  } catch (error) {
    console.error(`GET /api/booking/reservations/${params.id} error:`, error)
    return errorResponse("Failed to fetch booking", undefined, 500)
  }
}

// PUT /api/booking/reservations/[id] - Mettre à jour une réservation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(["dev", "admin"])
    if (!authResult.authorized) {
      return authResult.response
    }

    await connectDB()

    const body = await request.json()

    const updateData: Record<string, unknown> = {}

    if (body.spaceId !== undefined) updateData.spaceId = body.spaceId
    if (body.spaceName !== undefined) updateData.spaceName = body.spaceName
    if (body.clientId !== undefined) updateData.clientId = body.clientId
    if (body.clientName !== undefined) updateData.clientName = body.clientName
    if (body.clientEmail !== undefined) updateData.clientEmail = body.clientEmail
    if (body.reservationType !== undefined) updateData.reservationType = body.reservationType
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate)
    if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate)
    if (body.startTime !== undefined) updateData.startTime = body.startTime
    if (body.endTime !== undefined) updateData.endTime = body.endTime
    if (body.numberOfPeople !== undefined) updateData.numberOfPeople = body.numberOfPeople
    if (body.status !== undefined) {
      updateData.status = body.status
      if (body.status === "cancelled") {
        updateData.cancelledAt = new Date()
        if (body.cancelReason) updateData.cancelReason = body.cancelReason
      }
    }
    if (body.totalPrice !== undefined) updateData.totalPrice = body.totalPrice
    if (body.depositPaid !== undefined) updateData.depositPaid = body.depositPaid
    if (body.notes !== undefined) updateData.notes = body.notes

    const booking = await Booking.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).lean()

    if (!booking) {
      return errorResponse("Booking not found", undefined, 404)
    }

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
      createdAt: booking.createdAt?.toISOString(),
      updatedAt: booking.updatedAt?.toISOString(),
      cancelledAt: booking.cancelledAt?.toISOString(),
      cancelReason: booking.cancelReason,
    }

    return successResponse(data, "Booking updated successfully")
  } catch (error) {
    console.error(`PUT /api/booking/reservations/${params.id} error:`, error)
    return errorResponse("Failed to update booking", undefined, 500)
  }
}

// DELETE /api/booking/reservations/[id] - Supprimer une réservation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(["dev", "admin"])
    if (!authResult.authorized) {
      return authResult.response
    }

    await connectDB()

    const booking = await Booking.findByIdAndDelete(params.id)

    if (!booking) {
      return errorResponse("Booking not found", undefined, 404)
    }

    return successResponse(null, "Booking deleted successfully")
  } catch (error) {
    console.error(`DELETE /api/booking/reservations/${params.id} error:`, error)
    return errorResponse("Failed to delete booking", undefined, 500)
  }
}
