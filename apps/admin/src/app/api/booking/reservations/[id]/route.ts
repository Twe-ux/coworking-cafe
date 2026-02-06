import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectDB } from "@/lib/db"
import { Booking } from "@coworking-cafe/database"
import { generateValidatedEmail, generateReservationRejectedEmail } from "@coworking-cafe/email"
import { sendEmail, sendBookingModifiedEmail } from "@/lib/email/emailService"
import type { Booking as BookingType, BookingStatus, ReservationType, CaptureMethod } from "@/types/booking"
import { Types } from "mongoose"

// Interface pour le user populé
interface PopulatedUser {
  _id: Types.ObjectId
  firstName?: string
  lastName?: string
  email: string
}

// Interface pour le booking MongoDB avec user populé
interface BookingDocumentWithUser {
  _id: Types.ObjectId
  user?: PopulatedUser | Types.ObjectId
  space?: Types.ObjectId
  spaceType?: string
  reservationType?: ReservationType
  date: Date
  startTime?: string
  endTime?: string
  numberOfPeople: number
  status: BookingStatus
  totalPrice: number
  basePrice?: number
  amountPaid?: number
  paymentStatus?: string
  captureMethod?: CaptureMethod
  depositAmount?: number
  depositRequired?: boolean
  depositFileUrl?: string
  isAdminBooking?: boolean
  notes?: string
  message?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  cancelReason?: string
  cancelledAt?: Date
  createdAt?: Date
  updatedAt?: Date
  completedAt?: Date
}

// Helper pour vérifier si user est populé
function isPopulatedUser(user: PopulatedUser | Types.ObjectId | undefined): user is PopulatedUser {
  return user !== undefined && typeof user === 'object' && '_id' in user && 'email' in user
}

// Helper pour mapper un booking vers le type attendu
function mapBookingToType(booking: BookingDocumentWithUser): BookingType {
  const populatedUser = isPopulatedUser(booking.user) ? booking.user : undefined

  const clientName = populatedUser?.firstName && populatedUser?.lastName
    ? `${populatedUser.firstName} ${populatedUser.lastName}`
    : populatedUser?.email || booking.contactName || "Client inconnu"

  const clientId = isPopulatedUser(booking.user)
    ? booking.user._id.toString()
    : (booking.user instanceof Types.ObjectId ? booking.user.toString() : "")

  return {
    _id: booking._id.toString(),
    spaceId: booking.space?.toString() || booking._id.toString(),
    spaceName: booking.spaceType || "Espace",
    clientId,
    clientName,
    clientEmail: populatedUser?.email || booking.contactEmail || "",
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
    isAdminBooking: booking.isAdminBooking || false,
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
      .lean() as BookingDocumentWithUser | null

    if (!booking) {
      return errorResponse("Booking not found", undefined, 404)
    }

    return successResponse(mapBookingToType(booking))
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error(`GET /api/booking/reservations/${params.id} error:`, error)
    return errorResponse("Failed to fetch booking", errorMessage, 500)
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
      .lean() as BookingDocumentWithUser | null

    if (!booking) {
      return errorResponse("Booking not found", undefined, 404)
    }

    // Send email on status change
    const populatedUser = isPopulatedUser(booking.user) ? booking.user : undefined
    const clientEmail = populatedUser?.email || booking.contactEmail
    const clientName = (populatedUser?.firstName && populatedUser?.lastName)
      ? `${populatedUser.firstName} ${populatedUser.lastName}`
      : booking.contactName || populatedUser?.email || "Client"

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
        spaceName: booking.spaceType || "Espace",
        date: formatDateForEmail(booking.date),
        startTime: booking.startTime || "09:00",
        endTime: booking.endTime || "18:00",
        numberOfPeople: booking.numberOfPeople || 1,
        totalPrice: booking.totalPrice || 0,
        confirmationNumber: params.id,
      }

      if (body.status === "confirmed") {
        // Send confirmation email - choisir template selon isAdminBooking
        if (booking.isAdminBooking) {
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
        if (booking.isAdminBooking) {
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error(`PATCH /api/booking/reservations/${params.id} error:`, error)
    return errorResponse("Failed to update booking", errorMessage, 500)
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
      .lean() as BookingDocumentWithUser | null

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
      .lean() as BookingDocumentWithUser | null

    if (!booking) {
      return errorResponse("Booking not found", undefined, 404)
    }

    // Send email if confirmed booking was modified (not status change)
    const populatedUser = isPopulatedUser(booking.user) ? booking.user : undefined
    const clientEmail = populatedUser?.email || booking.contactEmail
    const clientName = (populatedUser?.firstName && populatedUser?.lastName)
      ? `${populatedUser.firstName} ${populatedUser.lastName}`
      : booking.contactName || populatedUser?.email || "Client"

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
          spaceName: booking.spaceType || "Espace",
          date: formatDateForEmail(booking.date),
          startTime: booking.startTime || "09:00",
          endTime: booking.endTime || "18:00",
          numberOfPeople: booking.numberOfPeople || 1,
          totalPrice: booking.totalPrice || 0,
          confirmationNumber: params.id,
        })
        console.log(`✉️ Email de modification envoyé à ${clientEmail}`)
      } catch (emailError) {
        const errorMsg = emailError instanceof Error ? emailError.message : "Unknown error"
        console.error("Error sending modification email:", errorMsg)
        // Don't fail the request if email fails
      }
    }

    return successResponse(mapBookingToType(booking), "Booking updated successfully")
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error(`PUT /api/booking/reservations/${params.id} error:`, error)
    return errorResponse("Failed to update booking", errorMessage, 500)
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error(`DELETE /api/booking/reservations/${params.id} error:`, error)
    return errorResponse("Failed to delete booking", errorMessage, 500)
  }
}
