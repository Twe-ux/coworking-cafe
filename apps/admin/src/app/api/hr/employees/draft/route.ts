import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { connectMongoose } from '@/lib/mongodb'
import Employee from '@/models/employee'

/**
 * GET /api/hr/employees/draft - Récupérer le brouillon en cours
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const userRole = (session.user as any).role
    if (!['dev', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    await connectMongoose()

    // Chercher un brouillon pour cet utilisateur
    const draft = await Employee.findOne({
      isDraft: true,
      createdBy: session.user.id,
    })
      .sort({ updatedAt: -1 })
      .lean()

    if (!draft) {
      return NextResponse.json({
        success: true,
        data: null,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: (draft as any)._id.toString(),
        firstName: (draft as any).firstName,
        lastName: (draft as any).lastName,
        email: (draft as any).email,
        phone: (draft as any).phone,
        dateOfBirth: (draft as any).dateOfBirth,
        placeOfBirth: (draft as any).placeOfBirth,
        nationality: (draft as any).nationality,
        address: (draft as any).address,
        socialSecurityNumber: (draft as any).socialSecurityNumber,
        contractType: (draft as any).contractType,
        contractualHours: (draft as any).contractualHours,
        hireDate: (draft as any).hireDate,
        hireTime: (draft as any).hireTime,
        endDate: (draft as any).endDate,
        level: (draft as any).level,
        step: (draft as any).step,
        hourlyRate: (draft as any).hourlyRate,
        monthlySalary: (draft as any).monthlySalary,
        employeeRole: (draft as any).employeeRole,
        availability: (draft as any).availability,
        clockingCode: (draft as any).clockingCode,
        color: (draft as any).color,
        role: (draft as any).role,
        bankDetails: (draft as any).bankDetails,
        onboardingStatus: (draft as any).onboardingStatus,
      },
    })
  } catch (error: any) {
    console.error('❌ Erreur API GET draft:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération du brouillon',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/hr/employees/draft - Sauvegarder un brouillon
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

    const userRole = (session.user as any).role
    if (!['dev', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    const data = await request.json()

    await connectMongoose()

    // Chercher un brouillon existant pour cet utilisateur
    let draft = await Employee.findOne({
      isDraft: true,
      createdBy: session.user.id,
    })

    const draftData: any = {
      isDraft: true,
      isActive: false,
      createdBy: session.user.id,
    }

    // Copier toutes les données fournies
    if (data.firstName) draftData.firstName = data.firstName
    if (data.lastName) draftData.lastName = data.lastName
    if (data.email) draftData.email = data.email
    if (data.phone) draftData.phone = data.phone
    if (data.dateOfBirth) draftData.dateOfBirth = data.dateOfBirth // String YYYY-MM-DD
    if (data.placeOfBirth) draftData.placeOfBirth = data.placeOfBirth
    if (data.nationality) draftData.nationality = data.nationality
    if (data.address) draftData.address = data.address
    if (data.socialSecurityNumber)
      draftData.socialSecurityNumber = data.socialSecurityNumber
    if (data.contractType) draftData.contractType = data.contractType
    if (data.contractualHours) draftData.contractualHours = data.contractualHours
    if (data.hireDate) draftData.hireDate = data.hireDate // String YYYY-MM-DD
    if (data.hireTime) draftData.hireTime = data.hireTime
    if (data.endDate) draftData.endDate = data.endDate // String YYYY-MM-DD
    if (data.level) draftData.level = data.level
    if (data.step !== undefined) draftData.step = data.step
    if (data.hourlyRate) draftData.hourlyRate = data.hourlyRate
    if (data.monthlySalary) draftData.monthlySalary = data.monthlySalary
    if (data.employeeRole) draftData.employeeRole = data.employeeRole
    if (data.availability) draftData.availability = data.availability
    if (data.clockingCode) draftData.clockingCode = data.clockingCode
    if (data.color) draftData.color = data.color
    if (data.bankDetails) draftData.bankDetails = data.bankDetails
    if (data.onboardingStatus) draftData.onboardingStatus = data.onboardingStatus

    if (draft) {
      // Mettre à jour le brouillon existant
      Object.assign(draft, draftData)
      await draft.save({ validateBeforeSave: false })
    } else {
      // Créer un nouveau brouillon (sans validation stricte)
      draft = new Employee(draftData)
      await draft.save({ validateBeforeSave: false })
    }

    return NextResponse.json({
      success: true,
      message: 'Brouillon sauvegardé',
      data: {
        id: draft._id.toString(),
      },
    })
  } catch (error: any) {
    console.error('❌ Erreur API POST draft:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la sauvegarde du brouillon',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/hr/employees/draft - Supprimer le brouillon
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const userRole = (session.user as any).role
    if (!['dev', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    await connectMongoose()

    await Employee.deleteMany({
      isDraft: true,
      createdBy: session.user.id,
    })

    return NextResponse.json({
      success: true,
      message: 'Brouillon supprimé',
    })
  } catch (error: any) {
    console.error('❌ Erreur API DELETE draft:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la suppression du brouillon',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
