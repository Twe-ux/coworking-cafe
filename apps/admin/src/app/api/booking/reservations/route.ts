import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { successResponse, errorResponse } from "@/lib/api/response"
import { connectDB } from "@/lib/db"
import { Booking } from "@coworking-cafe/database"
import type { Booking as BookingType, ReservationType, BookingStatus, CaptureMethod } from "@/types/booking"
import type { Types } from "mongoose"

/**
 * Populated user from MongoDB
 */
interface PopulatedUser {
  _id: Types.ObjectId
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
}

/**
 * MongoDB Booking document from lean() query
 */
interface LeanBookingDocument {
  _id: Types.ObjectId
  user?: PopulatedUser
  space?: Types.ObjectId
  spaceType: string
  date: Date
  startTime?: string
  endTime?: string
  numberOfPeople: number
  status: BookingStatus
  totalPrice: number
  basePrice?: number
  servicesPrice?: number
  invoiceOption?: boolean
  reservationType?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  contactCompany?: string
  notes?: string
  message?: string
  amountPaid?: number
  captureMethod?: CaptureMethod
  depositAmount?: number
  depositRequired?: boolean
  depositFileUrl?: string | null
  isAdminBooking?: boolean
  createdAt?: Date
  updatedAt?: Date
  cancelledAt?: Date
  cancelReason?: string
}

/**
 * MongoDB Booking document from toObject()
 */
interface BookingDocumentObject {
  _id: Types.ObjectId
  user?: Types.ObjectId | PopulatedUser
  space?: Types.ObjectId
  spaceType: string
  date: Date
  startTime?: string
  endTime?: string
  numberOfPeople: number
  status: BookingStatus
  totalPrice: number
  basePrice?: number
  servicesPrice?: number
  invoiceOption?: boolean
  reservationType?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  contactCompany?: string
  notes?: string
  message?: string
  amountPaid?: number
  captureMethod?: CaptureMethod
  depositAmount?: number
  depositRequired?: boolean
  depositFileUrl?: string | null
  isAdminBooking?: boolean
  createdAt?: Date
  updatedAt?: Date
  cancelledAt?: Date
  cancelReason?: string
}

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
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const isPublic = searchParams.get("public") === "true"

    // Public mode: no auth needed, only confirmed reservations
    if (!isPublic) {
      const authResult = await requireAuth(["dev", "admin", "staff"])
      if (!authResult.authorized) {
        return authResult.response
      }
    }

    await connectDB()

    // Filtres optionnels
    const spaceId = searchParams.get("spaceId")
    const clientId = searchParams.get("clientId")
    const status = searchParams.get("status")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const filter: Record<string, unknown> = {}

    // Public mode forces confirmed status only
    if (isPublic) {
      filter.status = "confirmed"
    } else {
      if (status) filter.status = status
    }

    if (spaceId) filter.space = spaceId
    if (clientId) filter.user = clientId
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) }
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ date: -1 })
      .lean()

    const data: BookingType[] = (bookings as unknown as LeanBookingDocument[]).map((booking) => {
      const user = booking.user

      // Priority: user name > contactName > email > fallback
      const clientName = (user?.firstName && user?.lastName)
        ? `${user.firstName} ${user.lastName}`
        : booking.contactName || user?.email || booking.contactEmail || 'Client inconnu'

      return {
        _id: booking._id.toString(),
        spaceId: booking.space?.toString() || booking._id.toString(),
        spaceName: booking.spaceType || 'Espace',
        clientId: user?._id?.toString() || (typeof booking.user === 'string' ? booking.user : ''),
        clientName,
        clientEmail: user?.email || booking.contactEmail || '',
        clientPhone: user?.phone || booking.contactPhone || '',
        clientCompany: booking.contactCompany || '',
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
        invoiceOption: booking.invoiceOption || false,
        depositPaid: booking.amountPaid || 0,
        captureMethod: booking.captureMethod,
        depositAmount: booking.depositAmount,
        isAdminBooking: booking.isAdminBooking || false,
        notes: booking.notes || booking.message || '',
        createdAt: booking.createdAt?.toISOString(),
        updatedAt: booking.updatedAt?.toISOString(),
        cancelledAt: booking.cancelledAt?.toISOString(),
        cancelReason: booking.cancelReason,
      }
    })

    return successResponse(data)
  } catch (error: unknown) {
    console.error("GET /api/booking/reservations error:", error)
    if (error instanceof Error) {
      return errorResponse("Failed to fetch bookings", error.message, 500)
    }
    return errorResponse("Failed to fetch bookings", "Unknown error", 500)
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
      !body.date ||
      !body.numberOfPeople ||
      body.totalPrice === undefined
    ) {
      return errorResponse(
        "Missing required fields",
        "spaceType, date, numberOfPeople, totalPrice are required",
        400
      )
    }

    // Validation: userId OU au minimum contactName requis
    if (!body.userId && !body.contactName) {
      return errorResponse(
        "Missing client information",
        "Either userId or at least contactName is required",
        400
      )
    }

    // Créer la réservation
    const booking = await Booking.create({
      user: body.userId,
      // Ne pas envoyer 'space' (deprecated, ObjectId attendu)
      spaceType: body.spaceType,
      date: new Date(body.date),
      startTime: body.startTime,
      endTime: body.endTime,
      numberOfPeople: body.numberOfPeople,
      status: body.status || "pending",
      basePrice: body.basePrice || body.totalPrice,
      servicesPrice: 0,
      totalPrice: body.totalPrice,
      invoiceOption: body.invoiceOption || false,
      reservationType: body.reservationType || "hourly",
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      contactCompany: body.clientCompany,
      notes: body.notes,
      requiresPayment: true,
      paymentStatus: body.depositRequired ? "unpaid" : "paid",
      amountPaid: body.depositPaid || 0,
      depositRequired: body.depositRequired || false,
      depositAmount: body.depositAmount || 0,
      depositFileUrl: body.depositFileUrl || null,
      isAdminBooking: true,
      additionalServices: [],
    })

    // Populate user pour retourner les données (si user existe)
    if (booking.user) {
      await booking.populate('user', 'firstName lastName email')
    }
    const populatedBooking = booking.toObject() as unknown as BookingDocumentObject
    const user = typeof populatedBooking.user === 'object' && populatedBooking.user !== null && '_id' in populatedBooking.user
      ? populatedBooking.user as PopulatedUser
      : undefined

    // Utiliser les infos de contact si pas d'user
    const clientName = user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : booking.contactName || user?.email || 'Client inconnu'

    const data: BookingType = {
      _id: booking._id.toString(),
      spaceId: booking.space?.toString() || booking._id.toString(),
      spaceName: booking.spaceType,
      clientId: user?._id?.toString() || booking.user?.toString() || '',
      clientName,
      clientEmail: user?.email || booking.contactEmail || '',
      clientPhone: user?.phone || booking.contactPhone || '',
      clientCompany: booking.contactCompany,
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
      invoiceOption: booking.invoiceOption || false,
      depositPaid: booking.amountPaid || 0,
      captureMethod: booking.captureMethod,
      depositAmount: booking.depositAmount,
      depositRequired: booking.depositRequired,
      depositFileUrl: booking.depositFileUrl,
      isAdminBooking: booking.isAdminBooking,
      notes: booking.notes || '',
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    }

    // Envoyer l'email selon le statut (si sendEmail est true)
    if (body.sendEmail !== false) {
      try {
        const emailData = {
          name: clientName,
          spaceName: booking.spaceType,
          date: booking.date.toISOString().split("T")[0],
          startTime: booking.startTime || '',
          endTime: booking.endTime || '',
          numberOfPeople: booking.numberOfPeople,
          totalPrice: booking.totalPrice,
        }

        if (booking.status === 'confirmed') {
          const { sendEmail } = await import('@/lib/email/emailService')

          // Choisir le template selon isAdminBooking
          if (booking.isAdminBooking) {
            // Template admin : pas de mention d'empreinte bancaire
            const { generateAdminBookingValidationEmail } = await import('@coworking-cafe/email')

            await sendEmail({
              to: user?.email || booking.contactEmail || '',
              subject: '✅ Réservation confirmée - CoworKing Café',
              html: generateAdminBookingValidationEmail({
                ...emailData,
                confirmationNumber: booking._id.toString(),
              }),
            })
          } else {
            // Template classique : avec mention d'empreinte bancaire
            const { generateValidatedEmail } = await import('@coworking-cafe/email')

            await sendEmail({
              to: user?.email || booking.contactEmail || '',
              subject: '✅ Réservation confirmée - CoworKing Café',
              html: generateValidatedEmail({
                ...emailData,
                confirmationNumber: booking._id.toString(),
              }),
            })
          }
        } else if (booking.status === 'pending' && booking.depositRequired) {
          // Email "en attente avec acompte"
          const { sendPendingWithDepositEmail } = await import('@/lib/email/emailService')

          await sendPendingWithDepositEmail(
            user?.email || booking.contactEmail || '',
            {
              ...emailData,
              depositAmount: booking.depositAmount || 0,
              depositFileUrl: booking.depositFileUrl || '',
            }
          )
        }
      } catch (emailError: unknown) {
        if (emailError instanceof Error) {
          console.error('Error sending booking email:', emailError.message)
        } else {
          console.error('Error sending booking email: Unknown error')
        }
        // Ne pas bloquer la création de réservation si l'email échoue
      }
    } else {
      console.log('📧 Email non envoyé (option désactivée)')
    }

    return successResponse(data, "Booking created successfully", 201)
  } catch (error: unknown) {
    console.error("POST /api/booking/reservations error:", error)
    if (error instanceof Error) {
      return errorResponse("Failed to create booking", error.message, 500)
    }
    return errorResponse("Failed to create booking", "Unknown error", 500)
  }
}
