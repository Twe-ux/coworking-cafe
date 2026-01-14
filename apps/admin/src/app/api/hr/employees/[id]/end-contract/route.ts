import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import mongoose from 'mongoose'
import { authOptions } from '@/lib/auth-options'
import { connectMongoose } from '@/lib/mongodb'
import Employee from '@/models/employee'

/**
 * PUT /api/hr/employees/[id]/end-contract - Terminer le contrat d'un employé
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

    const { endDate, endContractReason } = await request.json()

    if (!endDate || !endContractReason) {
      return NextResponse.json(
        {
          success: false,
          error: 'Date de fin et raison sont requises',
        },
        { status: 400 }
      )
    }

    await connectMongoose()

    const employee = await Employee.findById(params.id)

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employé non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour les informations de fin de contrat
    employee.endDate = new Date(endDate)
    employee.endContractReason = endContractReason
    employee.isActive = false
    employee.deletedAt = new Date()

    await employee.save()

    return NextResponse.json({
      success: true,
      message: 'Contrat terminé avec succès',
      data: {
        id: employee._id.toString(),
        endDate: employee.endDate,
        endContractReason: employee.endContractReason,
        isActive: employee.isActive,
      },
    })
  } catch (error: any) {
    console.error('❌ Erreur API PUT end-contract:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la fin du contrat',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
