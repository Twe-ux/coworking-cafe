import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectDB } from "@/lib/db"
import { Booking } from "@coworking-cafe/database"
import { generateValidatedEmail, generateReservationRejectedEmail } from "@coworking-cafe/email"
import { sendEmail, sendBookingModifiedEmail } from "@/lib/email/emailService"
import type { Booking as BookingType } from "@/types/booking"

// Helper pour mapper un booking vers le type attendu
function mapBookingToType(booking: any): BookingType {
  const user = booking.user || {}
  const clientName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.email || booking.contactName || "Client inconnu"

  return {
    _id: booking._id.toString(),
    spaceId: booking.space?.toString() || booking._id.toString(),
    spaceName: booking.spaceType || "Espace",
    clientId: booking.user?._id?.toString() || booking.user?.toString() || "",
    clientName,
    clientEmail: user.email || booking.contactEmail || "",
    reservationType: booking.reservationType || "hourly",
    startDate: booking.date.toISOString().split("T")[0],
    endDate: booking.date.toISOString().split("T")[0],
    startTime: booking.startTime || "",
    endTime: booking.endTime || "",
    numberOfPeople: booking.numberOfPeople,
    status: booking.status,
    totalPrice: booking.totalPrice,
    depositPaid: booking.amountPaid || 0,
    captureMethod: booking.captureMethod,
    depositAmount: booking.depositAmount,
    notes: booking.notes || booking.message || "",
    createdAt: booking.createdAt?.toISOString(),
    updatedAt: booking.updatedAt?.toISOString(),
    cancelledAt: booking.cancelledAt?.toISOString(),
    cancelReason: booking.cancelReason,
  }
}

// GET /api/booking/reservations/[id] - Récupérer une réservation
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
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

    const booking = await Booking.findById(params.id)
      .populate("user", "firstName lastName email")
      .lean()

    if (!booking) {
      return errorResponse("Booking not found", undefined, 404)
    }

    return successResponse(mapBookingToType(booking))
  } catch (error) {
    console.error(`GET /api/booking/reservations/${params.id} error:`, error)
    return errorResponse("Failed to fetch booking", undefined, 500)
  }
}

// PATCH /api/booking/reservations/[id] - Mise à jour partielle (status, etc.)
export async function PATCH(
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
    const previousStatus = (await Booking.findById(params.id).lean())?.status

    // Mise à jour du status
    if (body.status !== undefined) {
      updateData.status = body.status
      if (body.status === "cancelled") {
        updateData.cancelledAt = new Date()
        if (body.cancelReason) updateData.cancelReason = body.cancelReason
      }
      if (body.status === "completed") {
        updateData.completedAt = new Date()
      }
    }

    // Autres champs optionnels
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.amountPaid !== undefined) updateData.amountPaid = body.amountPaid
    if (body.paymentStatus !== undefined) updateData.paymentStatus = body.paymentStatus

    const booking = await Booking.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("user", "firstName lastName email")
      .lean()

    if (!booking) {
      return errorResponse("Booking not found", undefined, 404)
    }

    // Send email on status change
    const bookingAny = booking as any
    const user = bookingAny.user || {}
    const clientEmail = user.email || bookingAny.contactEmail
    const clientName = (user.firstName && user.lastName)
      ? `${user.firstName} ${user.lastName}`
      : bookingAny.contactName || user.email || "Client"

    if (clientEmail && body.status && body.status !== previousStatus) {
      // Format date for email
      const formatDateForEmail = (date: Date | string): string => {
        const d = new Date(date)
        return d.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      }

      const emailData = {
        name: clientName,
        spaceName: bookingAny.spaceType || "Espace",
        date: formatDateForEmail(bookingAny.date),
        startTime: bookingAny.startTime || "09:00",
        endTime: bookingAny.endTime || "18:00",
        numberOfPeople: bookingAny.numberOfPeople || 1,
        totalPrice: bookingAny.totalPrice || 0,
        confirmationNumber: params.id,
      }

      if (body.status === "confirmed") {
        // Send confirmation email - choisir template selon isAdminBooking
        if (bookingAny.isAdminBooking) {
          const { generateAdminBookingValidationEmail } = await import('@coworking-cafe/email')
          const html = generateAdminBookingValidationEmail(emailData)
          await sendEmail({
            to: clientEmail,
            subject: "✅ Réservation confirmée - CoworKing Café",
            html,
          })
        } else {
          const html = generateValidatedEmail(emailData)
          await sendEmail({
            to: clientEmail,
            subject: "✅ Réservation confirmée - CoworKing Café by Anticafé",
            html,
          })
        }
        console.log(`✉️ Email de confirmation envoyé à ${clientEmail}`)
      } else if (body.status === "cancelled") {
        // Send rejection/cancellation email with reason - choisir template selon isAdminBooking
        if (bookingAny.isAdminBooking) {
          const { generateAdminBookingCancellationEmail } = await import('@coworking-cafe/email')
          const html = generateAdminBookingCancellationEmail({
            ...emailData,
            reason: body.cancelReason,
          })
          await sendEmail({
            to: clientEmail,
            subject: "❌ Réservation annulée - CoworKing Café",
            html,
          })
        } else {
          const html = generateReservationRejectedEmail({
            ...emailData,
            reason: body.cancelReason,
          })
          await sendEmail({
            to: clientEmail,
            subject: "❌ Réservation refusée - CoworKing Café by Anticafé",
            html,
          })
        }
        console.log(`✉️ Email d'annulation envoyé à ${clientEmail}`)
      }
    }

    return successResponse(mapBookingToType(booking), "Booking updated successfully")
  } catch (error) {
    console.error(`PATCH /api/booking/reservations/${params.id} error:`, error)
    return errorResponse("Failed to update booking", undefined, 500)
  }
}

// PUT /api/booking/reservations/[id] - Mettre à jour une réservation complète
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

    // Récupérer le booking AVANT modification
    const previousBooking = await Booking.findById(params.id)
      .populate("user", "firstName lastName email")
      .lean()

    if (!previousBooking) {
      return errorResponse("Booking not found", undefined, 404)
    }

    const previousStatus = previousBooking.status
    const updateData: Record<string, unknown> = {}

    // Détection des champs modifiés (pour l'email)
    const fieldsModified = {
      spaceType: body.spaceType !== undefined && body.spaceType !== previousBooking.spaceType,
      date: body.date !== undefined && new Date(body.date).getTime() !== new Date(previousBooking.date).getTime(),
      startTime: body.startTime !== undefined && body.startTime !== previousBooking.startTime,
      endTime: body.endTime !== undefined && body.endTime !== previousBooking.endTime,
      numberOfPeople: body.numberOfPeople !== undefined && body.numberOfPeople !== previousBooking.numberOfPeople,
      totalPrice: body.totalPrice !== undefined && body.totalPrice !== previousBooking.totalPrice,
    }

    const hasDataModifications = Object.values(fieldsModified).some(modified => modified)

    // Champs du modèle Booking
    if (body.spaceType !== undefined) updateData.spaceType = body.spaceType
    if (body.space !== undefined) updateData.space = body.space
    if (body.user !== undefined) updateData.user = body.user
    if (body.reservationType !== undefined) updateData.reservationType = body.reservationType
    if (body.date !== undefined) updateData.date = new Date(body.date)
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
    if (body.basePrice !== undefined) updateData.basePrice = body.basePrice
    if (body.amountPaid !== undefined) updateData.amountPaid = body.amountPaid
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.contactName !== undefined) updateData.contactName = body.contactName
    if (body.contactEmail !== undefined) updateData.contactEmail = body.contactEmail
    if (body.contactPhone !== undefined) updateData.contactPhone = body.contactPhone

    const booking = await Booking.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("user", "firstName lastName email")
      .lean()

    if (!booking) {
      return errorResponse("Booking not found", undefined, 404)
    }

    // Send email if confirmed booking was modified (not status change)
    const bookingAny = booking as any
    const user = bookingAny.user || {}
    const clientEmail = user.email || bookingAny.contactEmail
    const clientName = (user.firstName && user.lastName)
      ? `${user.firstName} ${user.lastName}`
      : bookingAny.contactName || user.email || "Client"

    // Si la réservation était "confirmed" et qu'on a modifié des données (pas juste le statut)
    if (clientEmail && previousStatus === "confirmed" && hasDataModifications) {
      // Format date for email
      const formatDateForEmail = (date: Date | string): string => {
        const d = new Date(date)
        return d.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      }

      try {
        await sendBookingModifiedEmail(clientEmail, {
          name: clientName,
          spaceName: bookingAny.spaceType || "Espace",
          date: formatDateForEmail(bookingAny.date),
          startTime: bookingAny.startTime || "09:00",
          endTime: bookingAny.endTime || "18:00",
          numberOfPeople: bookingAny.numberOfPeople || 1,
          totalPrice: bookingAny.totalPrice || 0,
          confirmationNumber: params.id,
        })
        console.log(`✉️ Email de modification envoyé à ${clientEmail}`)
      } catch (emailError) {
        console.error("Error sending modification email:", emailError)
        // Don't fail the request if email fails
      }
    }

    return successResponse(mapBookingToType(booking), "Booking updated successfully")
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
