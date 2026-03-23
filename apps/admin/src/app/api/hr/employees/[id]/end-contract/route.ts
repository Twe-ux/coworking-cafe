import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import mongoose from 'mongoose'
import { authOptions } from '@/lib/auth-options'
import { connectMongoose } from '@/lib/mongodb'
import Employee from '@/models/employee'
import type { EndContractReason } from '@/types/hr'
import type { SessionUser } from '@/types/session'

/** Max resignation letter file size: 5MB */
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

interface TerminationLetterPayload {
  filename: string
  contentBase64: string
}

interface EmployeeDocument {
  _id: mongoose.Types.ObjectId
  endDate?: string
  endContractReason?: EndContractReason
  resignationLetter?: {
    filename: string
    contentBase64: string
    uploadedAt: Date
    uploadedBy: string
  }
  trialPeriodTerminationLetter?: {
    filename: string
    contentBase64: string
    uploadedAt: Date
    uploadedBy: string
  }
  isActive: boolean
  deletedAt?: Date
  save: () => Promise<EmployeeDocument>
}

/**
 * Validate termination letter PDF payload (resignation or trial period termination).
 * Returns an error message string if invalid, or null if valid.
 */
function validateTerminationLetter(
  letter: TerminationLetterPayload
): string | null {
  if (!letter.filename || typeof letter.filename !== 'string') {
    return 'Le nom du fichier est requis'
  }

  if (!letter.filename.toLowerCase().endsWith('.pdf')) {
    return 'Seuls les fichiers PDF sont acceptés'
  }

  if (!letter.contentBase64 || typeof letter.contentBase64 !== 'string') {
    return 'Le contenu du fichier est requis'
  }

  // Check PDF signature (base64 of "%PDF-" starts with "JVBERi0")
  if (!letter.contentBase64.startsWith('JVBERi0')) {
    return 'Le fichier ne semble pas être un PDF valide'
  }

  // Check decoded file size (max 5MB)
  const decodedSize = Buffer.from(letter.contentBase64, 'base64').length
  if (decodedSize > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (decodedSize / (1024 * 1024)).toFixed(1)
    return `Le fichier est trop volumineux (${sizeMB}MB). Maximum: 5MB`
  }

  return null
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

    const { endDate, endContractReason, resignationLetter, trialPeriodTerminationLetter } = await request.json()

    if (!endDate || !endContractReason) {
      return NextResponse.json(
        {
          success: false,
          error: 'Date de fin et raison sont requises',
        },
        { status: 400 }
      )
    }

    // Validate termination letter if provided
    const letterToValidate = endContractReason === 'démission'
      ? resignationLetter
      : trialPeriodTerminationLetter

    if (letterToValidate) {
      const validationError = validateTerminationLetter(letterToValidate)
      if (validationError) {
        return NextResponse.json(
          { success: false, error: validationError },
          { status: 400 }
        )
      }
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

    // Store termination letter based on reason
    if (endContractReason === 'démission' && resignationLetter) {
      employee.resignationLetter = {
        filename: resignationLetter.filename.trim(),
        contentBase64: resignationLetter.contentBase64,
        uploadedAt: new Date(),
        uploadedBy: session.user.id,
      }
    } else if (endContractReason === 'fin-periode-essai' && trialPeriodTerminationLetter) {
      employee.trialPeriodTerminationLetter = {
        filename: trialPeriodTerminationLetter.filename.trim(),
        contentBase64: trialPeriodTerminationLetter.contentBase64,
        uploadedAt: new Date(),
        uploadedBy: session.user.id,
      }
    }

    await employee.save()

    return NextResponse.json({
      success: true,
      message: 'Contrat terminé avec succès',
      data: {
        id: employee._id.toString(),
        endDate: employee.endDate,
        endContractReason: employee.endContractReason,
        isActive: employee.isActive,
        hasResignationLetter: !!employee.resignationLetter,
        hasTrialPeriodTerminationLetter: !!employee.trialPeriodTerminationLetter,
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
