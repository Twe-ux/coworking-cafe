import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { connectMongoose } from '@/lib/mongodb'
import Employee from '@/models/employee'
import type { Employee as EmployeeType, EmployeeAddress, PlaceOfBirth, WeeklyAvailability, OnboardingStatus } from '@/types/hr'
import type { ApiResponse } from '@/types/timeEntry'
import { Types } from 'mongoose'

interface MongoDBValidationError {
  name: string
  errors: Record<string, { message: string }>
}

interface EmployeeDraftData {
  _id: Types.ObjectId
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  placeOfBirth?: PlaceOfBirth
  nationality?: string
  address?: EmployeeAddress
  socialSecurityNumber?: string
  contractType?: string
  contractualHours?: number
  hireDate?: string
  hireTime?: string
  endDate?: string
  level?: string
  step?: number
  hourlyRate?: number
  monthlySalary?: number
  employeeRole?: string
  availability?: WeeklyAvailability
  clockingCode?: string
  color?: string
  role?: string
  bankDetails?: {
    iban: string
    bic: string
    bankName: string
  }
  onboardingStatus?: OnboardingStatus
}

interface EmployeeDraftResponse {
  _id: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  placeOfBirth?: PlaceOfBirth
  nationality?: string
  address?: EmployeeAddress
  socialSecurityNumber?: string
  contractType?: string
  contractualHours?: number
  hireDate?: string
  hireTime?: string
  endDate?: string
  level?: string
  step?: number
  hourlyRate?: number
  monthlySalary?: number
  employeeRole?: string
  availability?: WeeklyAvailability
  clockingCode?: string
  color?: string
  role?: string
  bankDetails?: {
    iban: string
    bic: string
    bankName: string
  }
  onboardingStatus?: OnboardingStatus
}

interface DraftPayload {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  placeOfBirth?: PlaceOfBirth
  nationality?: string
  address?: EmployeeAddress
  socialSecurityNumber?: string
  contractType?: string
  contractualHours?: number
  hireDate?: string
  hireTime?: string
  endDate?: string
  level?: string
  step?: number
  hourlyRate?: number
  monthlySalary?: number
  employeeRole?: string
  availability?: WeeklyAvailability
  clockingCode?: string
  color?: string
  bankDetails?: {
    iban: string
    bic: string
    bankName: string
  }
  onboardingStatus?: OnboardingStatus
}

interface SessionUser {
  id: string
  role: string
}

/**
 * GET /api/hr/employees/draft - Récupérer le brouillon en cours
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<EmployeeDraftResponse | null>>> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const userRole = (session.user as SessionUser).role
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

    const typedDraft = draft as unknown as EmployeeDraftData

    return NextResponse.json({
      success: true,
      data: {
        _id: typedDraft._id.toString(),
        firstName: typedDraft.firstName,
        lastName: typedDraft.lastName,
        email: typedDraft.email,
        phone: typedDraft.phone,
        dateOfBirth: typedDraft.dateOfBirth,
        placeOfBirth: typedDraft.placeOfBirth,
        nationality: typedDraft.nationality,
        address: typedDraft.address,
        socialSecurityNumber: typedDraft.socialSecurityNumber,
        contractType: typedDraft.contractType,
        contractualHours: typedDraft.contractualHours,
        hireDate: typedDraft.hireDate,
        hireTime: typedDraft.hireTime,
        endDate: typedDraft.endDate,
        level: typedDraft.level,
        step: typedDraft.step,
        hourlyRate: typedDraft.hourlyRate,
        monthlySalary: typedDraft.monthlySalary,
        employeeRole: typedDraft.employeeRole,
        availability: typedDraft.availability,
        clockingCode: typedDraft.clockingCode,
        color: typedDraft.color,
        role: typedDraft.role,
        bankDetails: typedDraft.bankDetails,
        onboardingStatus: typedDraft.onboardingStatus,
      },
    })
  } catch (error: unknown) {
    console.error('❌ Erreur API GET draft:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération du brouillon',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/hr/employees/draft - Sauvegarder un brouillon
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const userRole = (session.user as SessionUser).role
    if (!['dev', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    const data: DraftPayload = await request.json()

    await connectMongoose()

    // Chercher un brouillon existant pour cet utilisateur
    let draft = await Employee.findOne({
      isDraft: true,
      createdBy: session.user.id,
    })

    const draftData: Partial<EmployeeType> & { isDraft: boolean; isActive: boolean; createdBy: string } = {
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
    if (data.contractType) draftData.contractType = data.contractType as EmployeeType['contractType']
    if (data.contractualHours) draftData.contractualHours = data.contractualHours
    if (data.hireDate) draftData.hireDate = data.hireDate // String YYYY-MM-DD
    if (data.hireTime) draftData.hireTime = data.hireTime
    if (data.endDate) draftData.endDate = data.endDate // String YYYY-MM-DD
    if (data.level) draftData.level = data.level
    if (data.step !== undefined) draftData.step = data.step
    if (data.hourlyRate) draftData.hourlyRate = data.hourlyRate
    if (data.monthlySalary) draftData.monthlySalary = data.monthlySalary
    if (data.employeeRole) draftData.employeeRole = data.employeeRole as EmployeeType['employeeRole']
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
  } catch (error: unknown) {
    console.error('❌ Erreur API POST draft:', error)

    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      const validationError = error as MongoDBValidationError
      const validationErrors = Object.values(validationError.errors).map(
        (err) => err.message
      )
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur de validation',
          details: validationErrors,
        },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la sauvegarde du brouillon',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/hr/employees/draft - Supprimer le brouillon
 */
export async function DELETE(request: NextRequest): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const userRole = (session.user as SessionUser).role
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
  } catch (error: unknown) {
    console.error('❌ Erreur API DELETE draft:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la suppression du brouillon',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}
