import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import mongoose from 'mongoose'
import { authOptions } from '@/lib/auth-options'
import { connectMongoose } from '@/lib/mongodb'
import Employee from '@/models/employee'
import {
  mapEmployeeToApi,
  mapEmployeeToApiSummary,
} from '@/lib/mappers'

/** Mongoose error interface */
interface MongooseError extends Error {
  name: string
  code?: number
  errors?: Record<string, { message: string }>
}

/**
 * GET /api/hr/employees/[id] - Recuperer un employe par ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifie' },
        { status: 401 }
      )
    }

    const userRole = session.user.role
    if (!['dev', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'ID employe invalide' },
        { status: 400 }
      )
    }

    await connectMongoose()

    const employee = await Employee.findById(params.id).lean()

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employe non trouve' },
        { status: 404 }
      )
    }

    const formattedEmployee = mapEmployeeToApi(employee)

    return NextResponse.json({
      success: true,
      data: formattedEmployee,
    })
  } catch (error) {
    const err = error as MongooseError
    console.error('Erreur API GET employee:', err)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la recuperation de l'employe",
        details: err.message,
      },
      { status: 500 }
    )
  }
}

/** Employee update request body type */
interface EmployeeUpdateBody {
  firstName?: string
  lastName?: string
  email?: string | null
  phone?: string | null
  dateOfBirth?: string
  placeOfBirth?: { city?: string; department?: string; country?: string }
  nationality?: string
  address?: { street?: string; postalCode?: string; city?: string }
  socialSecurityNumber?: string
  contractType?: string
  contractualHours?: number
  hireDate?: string
  hireTime?: string
  endDate?: string | null
  endContractReason?: string
  level?: string
  step?: number
  hourlyRate?: number
  monthlySalary?: number
  employeeRole?: string
  color?: string
  clockingCode?: string
  availability?: Record<string, unknown>
  onboardingStatus?: Record<string, unknown>
  workSchedule?: Record<string, unknown>
  bankDetails?: { iban?: string; bic?: string; bankName?: string }
  isActive?: boolean
  isDraft?: boolean
  deletedAt?: Date | null
}

/** Employee update data for Mongoose */
interface EmployeeUpdateData {
  firstName?: string
  lastName?: string
  email?: string | null
  phone?: string | null
  dateOfBirth?: Date
  placeOfBirth?: { city?: string; department?: string; country?: string }
  nationality?: string
  address?: { street?: string; postalCode?: string; city?: string }
  socialSecurityNumber?: string
  contractType?: string
  contractualHours?: number
  hireDate?: Date
  hireTime?: string
  endDate?: Date | null
  endContractReason?: string
  level?: string
  step?: number
  hourlyRate?: number
  monthlySalary?: number
  employeeRole?: string
  color?: string
  clockingCode?: string
  availability?: Record<string, unknown>
  onboardingStatus?: Record<string, unknown>
  workSchedule?: Record<string, unknown>
  bankDetails?: { iban?: string; bic?: string; bankName?: string }
  isActive?: boolean
  isDraft?: boolean
  deletedAt?: Date | null
}

/**
 * PUT /api/hr/employees/[id] - Mettre a jour un employe
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifie' },
        { status: 401 }
      )
    }

    const userRole = session.user.role
    if (!['dev', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'ID employe invalide' },
        { status: 400 }
      )
    }

    const data = (await request.json()) as EmployeeUpdateBody

    await connectMongoose()

    // Build update data
    const updateData: EmployeeUpdateData = {}

    // Basic fields
    if (data.firstName !== undefined) updateData.firstName = data.firstName.trim()
    if (data.lastName !== undefined) updateData.lastName = data.lastName.trim()
    if (data.email !== undefined) updateData.email = data.email?.trim() || null
    if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null

    // Personal info
    if (data.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(data.dateOfBirth)
    if (data.placeOfBirth !== undefined) updateData.placeOfBirth = data.placeOfBirth
    if (data.nationality !== undefined) updateData.nationality = data.nationality
    if (data.address !== undefined) updateData.address = data.address
    if (data.socialSecurityNumber !== undefined) updateData.socialSecurityNumber = data.socialSecurityNumber

    // Contract info
    if (data.contractType !== undefined) updateData.contractType = data.contractType
    if (data.contractualHours !== undefined) updateData.contractualHours = data.contractualHours
    if (data.hireDate !== undefined) updateData.hireDate = new Date(data.hireDate)
    if (data.hireTime !== undefined) updateData.hireTime = data.hireTime
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null
    if (data.endContractReason !== undefined) updateData.endContractReason = data.endContractReason

    // Compensation
    if (data.level !== undefined) updateData.level = data.level
    if (data.step !== undefined) updateData.step = data.step
    if (data.hourlyRate !== undefined) updateData.hourlyRate = data.hourlyRate
    if (data.monthlySalary !== undefined) updateData.monthlySalary = data.monthlySalary

    // Role and scheduling
    if (data.employeeRole !== undefined) updateData.employeeRole = data.employeeRole
    if (data.color !== undefined) updateData.color = data.color
    if (data.clockingCode !== undefined) updateData.clockingCode = data.clockingCode

    // Other data
    if (data.availability !== undefined) updateData.availability = data.availability
    if (data.onboardingStatus !== undefined) updateData.onboardingStatus = data.onboardingStatus
    if (data.workSchedule !== undefined) updateData.workSchedule = data.workSchedule
    if (data.bankDetails !== undefined) updateData.bankDetails = data.bankDetails
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.isDraft !== undefined) updateData.isDraft = data.isDraft
    if (data.deletedAt !== undefined) updateData.deletedAt = data.deletedAt

    const updatedEmployee = await Employee.findByIdAndUpdate(
      params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).lean()

    if (!updatedEmployee) {
      return NextResponse.json(
        { success: false, error: 'Employe non trouve' },
        { status: 404 }
      )
    }

    const formattedEmployee = mapEmployeeToApi(updatedEmployee)

    return NextResponse.json({
      success: true,
      message: 'Employe mis a jour avec succes',
      data: formattedEmployee,
    })
  } catch (error) {
    const err = error as MongooseError
    console.error('Erreur API PUT employee:', err)

    if (err.name === 'ValidationError' && err.errors) {
      const validationErrors = Object.values(err.errors).map((e) => e.message)
      return NextResponse.json(
        {
          success: false,
          error: 'Donnees invalides',
          details: validationErrors,
        },
        { status: 400 }
      )
    }

    if (err.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Un employe avec ces informations existe deja',
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la mise a jour de l'employe",
        details: err.message,
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/hr/employees/[id] - Supprimer un employe (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifie' },
        { status: 401 }
      )
    }

    const userRole = session.user.role
    if (!['dev', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'ID employe invalide' },
        { status: 400 }
      )
    }

    await connectMongoose()

    const employee = await Employee.findById(params.id)

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employe non trouve' },
        { status: 404 }
      )
    }

    // Soft delete: deactivate employee and mark deletedAt
    employee.isActive = false
    employee.deletedAt = new Date()
    await employee.save()

    return NextResponse.json({
      success: true,
      message: 'Employe desactive avec succes',
    })
  } catch (error) {
    const err = error as MongooseError
    console.error('Erreur API DELETE employee:', err)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la suppression de l'employe",
        details: err.message,
      },
      { status: 500 }
    )
  }
}
