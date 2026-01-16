import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import mongoose from 'mongoose'
import { authOptions } from '@/lib/auth-options'
import { connectMongoose } from '@/lib/mongodb'
import Employee from '@/models/employee'

/**
 * GET /api/hr/employees/[id] - Récupérer un employé par ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'ID employé invalide' },
        { status: 400 }
      )
    }

    await connectMongoose()

    const employee = await Employee.findById(params.id).lean()

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employé non trouvé' },
        { status: 404 }
      )
    }

    // Formater avec toutes les données HR
    const formattedEmployee = {
      _id: (employee as any)._id.toString(),
      id: (employee as any)._id.toString(),
      firstName: (employee as any).firstName,
      lastName: (employee as any).lastName,
      email: (employee as any).email,
      phone: (employee as any).phone,
      dateOfBirth: (employee as any).dateOfBirth,
      placeOfBirth: (employee as any).placeOfBirth,
      address: (employee as any).address,
      socialSecurityNumber: (employee as any).socialSecurityNumber,
      contractType: (employee as any).contractType,
      contractualHours: (employee as any).contractualHours,
      hireDate: (employee as any).hireDate,
      hireTime: (employee as any).hireTime,
      endDate: (employee as any).endDate,
      endContractReason: (employee as any).endContractReason,
      level: (employee as any).level,
      step: (employee as any).step,
      hourlyRate: (employee as any).hourlyRate,
      monthlySalary: (employee as any).monthlySalary,
      employeeRole: (employee as any).employeeRole,
      availability: (employee as any).availability,
      onboardingStatus: (employee as any).onboardingStatus,
      workSchedule: (employee as any).workSchedule,
      bankDetails: (employee as any).bankDetails,
      clockingCode: (employee as any).clockingCode,
      color: (employee as any).color,
      role: (employee as any).role,
      isActive: (employee as any).isActive,
      fullName: `${(employee as any).firstName} ${(employee as any).lastName}`,
      createdAt: (employee as any).createdAt,
      updatedAt: (employee as any).updatedAt,
    }

    return NextResponse.json({
      success: true,
      data: formattedEmployee,
    })
  } catch (error: any) {
    console.error('❌ Erreur API GET employee:', error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération de l'employé",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/hr/employees/[id] - Mettre à jour un employé
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'ID employé invalide' },
        { status: 400 }
      )
    }

    const data = await request.json()

    await connectMongoose()

    // Préparer les données à mettre à jour
    const updateData: any = {}

    // Champs de base
    if (data.firstName !== undefined) updateData.firstName = data.firstName.trim()
    if (data.lastName !== undefined) updateData.lastName = data.lastName.trim()
    if (data.email !== undefined) updateData.email = data.email ? data.email.trim() : null
    if (data.phone !== undefined) updateData.phone = data.phone ? data.phone.trim() : null

    // Informations personnelles
    if (data.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(data.dateOfBirth)
    if (data.placeOfBirth !== undefined) updateData.placeOfBirth = data.placeOfBirth
    if (data.address !== undefined) updateData.address = data.address
    if (data.socialSecurityNumber !== undefined) updateData.socialSecurityNumber = data.socialSecurityNumber

    // Informations contractuelles
    if (data.contractType !== undefined) updateData.contractType = data.contractType
    if (data.contractualHours !== undefined) updateData.contractualHours = data.contractualHours
    if (data.hireDate !== undefined) updateData.hireDate = new Date(data.hireDate)
    if (data.hireTime !== undefined) updateData.hireTime = data.hireTime
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null
    if (data.endContractReason !== undefined) updateData.endContractReason = data.endContractReason

    // Rémunération
    if (data.level !== undefined) updateData.level = data.level
    if (data.step !== undefined) updateData.step = data.step
    if (data.hourlyRate !== undefined) updateData.hourlyRate = data.hourlyRate
    if (data.monthlySalary !== undefined) updateData.monthlySalary = data.monthlySalary

    // Rôles et planning
    if (data.employeeRole !== undefined) updateData.employeeRole = data.employeeRole
    if (data.color !== undefined) updateData.color = data.color
    if (data.clockingCode !== undefined) updateData.clockingCode = data.clockingCode

    // Autres données
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
        { success: false, error: 'Employé non trouvé' },
        { status: 404 }
      )
    }

    const formattedEmployee = {
      id: (updatedEmployee as any)._id.toString(),
      firstName: (updatedEmployee as any).firstName,
      lastName: (updatedEmployee as any).lastName,
      email: (updatedEmployee as any).email,
      phone: (updatedEmployee as any).phone,
      role: (updatedEmployee as any).role,
      employeeRole: (updatedEmployee as any).employeeRole,
      color: (updatedEmployee as any).color,
      clockingCode: (updatedEmployee as any).clockingCode,
      isActive: (updatedEmployee as any).isActive,
      fullName: `${(updatedEmployee as any).firstName} ${(updatedEmployee as any).lastName}`,
      createdAt: (updatedEmployee as any).createdAt,
      updatedAt: (updatedEmployee as any).updatedAt,
    }

    return NextResponse.json({
      success: true,
      message: 'Employé mis à jour avec succès',
      data: formattedEmployee,
    })
  } catch (error: any) {
    console.error('❌ Erreur API PUT employee:', error)

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      )
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: validationErrors,
        },
        { status: 400 }
      )
    }

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Un employé avec ces informations existe déjà',
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la mise à jour de l'employé",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/hr/employees/[id] - Supprimer un employé (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'ID employé invalide' },
        { status: 400 }
      )
    }

    await connectMongoose()

    // Vérifier si l'employé existe
    const employee = await Employee.findById(params.id)

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employé non trouvé' },
        { status: 404 }
      )
    }

    // Soft delete : désactiver l'employé et marquer deletedAt
    employee.isActive = false
    employee.deletedAt = new Date()
    await employee.save()

    return NextResponse.json({
      success: true,
      message: 'Employé désactivé avec succès',
    })
  } catch (error: any) {
    console.error('❌ Erreur API DELETE employee:', error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la suppression de l'employé",
        details: error.message,
      },
      { status: 500 }
    )
  }
}
