import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectMongoose } from '@/lib/mongodb'
import Employee from '@/models/employee'
import Shift from '@/models/shift'

// Fonction utilitaire pour créer une date UTC pure à partir d'une string YYYY-MM-DD
function createLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
}

/**
 * GET /api/shifts - Récupérer la liste des créneaux
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier les permissions (dev, admin ou staff pour lecture)
    const userRole = (session?.user as any)?.role
    if (!['dev', 'admin', 'staff'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    await connectMongoose()

    const { searchParams } = new URL(request.url)

    // Paramètres de filtrage
    const employeeId = searchParams.get('employeeId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type')
    const active = searchParams.get('active')

    // Construction de la requête de filtrage
    const filter: any = {}

    if (employeeId) {
      filter.employeeId = employeeId
    }

    if (startDate || endDate) {
      filter.date = {}
      if (startDate) {
        filter.date.$gte = createLocalDate(startDate)
      }
      if (endDate) {
        filter.date.$lte = createLocalDate(endDate)
      }
    }

    if (type) {
      filter.type = type
    }

    if (active !== null && active !== undefined) {
      filter.isActive = active === 'true'
    }

    // Récupérer les créneaux avec les informations de l'employé
    const shifts = await Shift.find(filter)
      .populate('employeeId', 'firstName lastName role color')
      .sort({ date: 1, startTime: 1 })
      .lean()

    // Transformer les données pour le frontend
    const transformedShifts = shifts.map((shift: any) => ({
      id: shift._id.toString(),
      employeeId: shift.employeeId._id.toString(),
      employee: {
        id: shift.employeeId._id.toString(),
        firstName: shift.employeeId.firstName,
        lastName: shift.employeeId.lastName,
        fullName: `${shift.employeeId.firstName} ${shift.employeeId.lastName}`,
        role: shift.employeeId.role,
        color: shift.employeeId.color,
      },
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      type: shift.type,
      location: shift.location,
      notes: shift.notes,
      isActive: shift.isActive,
      timeRange: `${shift.startTime} - ${shift.endTime}`,
      createdAt: shift.createdAt,
      updatedAt: shift.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      data: transformedShifts,
      count: transformedShifts.length,
    })
  } catch (error: any) {
    console.error('❌ Erreur API GET shifts:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur lors de la récupération des créneaux',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/shifts - Créer un nouveau créneau
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const userRole = (session?.user as any)?.role
    if (!['dev', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { employeeId, date, startTime, endTime, type, location, notes } = body

    // Validation des champs requis
    if (!employeeId || !date || !startTime || !endTime || !type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Champs requis manquants',
          details: {
            employeeId: !employeeId ? "L'ID de l'employé est requis" : undefined,
            date: !date ? 'La date est requise' : undefined,
            startTime: !startTime ? "L'heure de début est requise" : undefined,
            endTime: !endTime ? "L'heure de fin est requise" : undefined,
            type: !type ? 'Le type de créneau est requis' : undefined,
          },
        },
        { status: 400 }
      )
    }

    await connectMongoose()

    // Vérifier que l'employé existe
    const employee = await Employee.findById(employeeId)
    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employé non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier les conflits de créneaux
    const conflictingShift = await Shift.findOne({
      employeeId,
      date: createLocalDate(date),
      isActive: true,
      $or: [
        {
          $and: [
            { startTime: { $lte: startTime } },
            { endTime: { $gt: startTime } },
          ],
        },
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gte: endTime } },
          ],
        },
        {
          $and: [
            { startTime: { $gte: startTime } },
            { endTime: { $lte: endTime } },
          ],
        },
      ],
    })

    if (conflictingShift) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conflit de créneaux détecté',
          details: {
            conflict: `Un créneau existe déjà de ${conflictingShift.startTime} à ${conflictingShift.endTime}`,
          },
        },
        { status: 409 }
      )
    }

    // Créer le nouveau créneau
    const newShift = new Shift({
      employeeId,
      date: createLocalDate(date),
      startTime,
      endTime,
      type,
      location: location?.trim() || undefined,
      notes: notes?.trim() || undefined,
    })

    await newShift.save()

    // Récupérer le créneau créé avec les informations de l'employé
    const populatedShift = await Shift.findById(newShift._id)
      .populate('employeeId', 'firstName lastName role color')
      .lean()

    if (!populatedShift) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération du créneau créé' },
        { status: 500 }
      )
    }

    const transformedShift = {
      id: (populatedShift as any)._id.toString(),
      employeeId: (populatedShift as any).employeeId._id.toString(),
      employee: {
        id: (populatedShift as any).employeeId._id.toString(),
        firstName: (populatedShift as any).employeeId.firstName,
        lastName: (populatedShift as any).employeeId.lastName,
        fullName: `${(populatedShift as any).employeeId.firstName} ${(populatedShift as any).employeeId.lastName}`,
        role: (populatedShift as any).employeeId.role,
        color: (populatedShift as any).employeeId.color,
      },
      date: (populatedShift as any).date,
      startTime: (populatedShift as any).startTime,
      endTime: (populatedShift as any).endTime,
      type: (populatedShift as any).type,
      location: (populatedShift as any).location,
      notes: (populatedShift as any).notes,
      isActive: (populatedShift as any).isActive,
      timeRange: `${(populatedShift as any).startTime} - ${(populatedShift as any).endTime}`,
      createdAt: (populatedShift as any).createdAt,
      updatedAt: (populatedShift as any).updatedAt,
    }

    return NextResponse.json(
      {
        success: true,
        data: transformedShift,
        message: 'Créneau créé avec succès',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ Erreur API POST shifts:', error)

    // Gestion des erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors: Record<string, string> = {}
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Erreurs de validation',
          details: validationErrors,
        },
        { status: 400 }
      )
    }

    // Gestion des erreurs de duplicata
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Un créneau existe déjà pour cet employé à cette date et heure',
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur lors de la création du créneau',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
