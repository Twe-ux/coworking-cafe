import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import mongoose from 'mongoose'
import { authOptions } from '@/lib/auth-options'
import { connectMongoose } from '@/lib/mongodb'
import Employee from '@/models/employee'
import type { EndContractReason } from '@/types/hr'
import type { SessionUser } from '@/types/session'

interface EmployeeDocument {
  _id: mongoose.Types.ObjectId
  endDate?: string
  endContractReason?: EndContractReason
  isActive: boolean
  deletedAt?: Date
  save: () => Promise<EmployeeDocument>
}

/**
 * PUT /api/hr/employees/[id]/end-contract - Terminer le contrat d'un employé
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
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

    const userRole = (session.user as SessionUser).role
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

    const employee = await Employee.findById(params.id) as EmployeeDocument | null

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employé non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour les informations de fin de contrat
    employee.endDate = endDate // Format YYYY-MM-DD
    employee.endContractReason = endContractReason
    employee.isActive = false
    employee.deletedAt = new Date() // deletedAt reste en Date (timestamp)

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
  } catch (error: unknown) {
    console.error('❌ Erreur API PUT end-contract:', error)

    // Gestion erreur CastError (MongoDB ID invalide)
    if (error && typeof error === 'object' && 'name' in error && error.name === 'CastError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Format d\'ID invalide',
          details: '',
        },
        { status: 400 }
      )
    }

    // Gestion erreur standard
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur lors de la fin du contrat',
          details: error.message,
        },
        { status: 500 }
      )
    }

    // Erreur inconnue
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la fin du contrat',
        details: 'Unknown error',
      },
      { status: 500 }
    )
  }
}
