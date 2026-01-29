/**
 * API Route: Send CDI Contract via Email
 * Receives PDF file from client and sends it via email using Resend
 */

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { Employee } from '@/models/employee'
import type { Employee as EmployeeType } from '@/types/hr'
import type { ApiResponse } from '@/types/timeEntry'

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * POST /api/hr/contract/send-email
 * Send contract PDF via email
 *
 * Request: FormData
 * - employeeId: string
 * - recipientEmail: string
 * - pdf: File (PDF blob)
 *
 * Response:
 * {
 *   success: true,
 *   data: { emailId: string },
 *   message: "Email envoyé avec succès"
 * }
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ emailId: string }>>> {
  // 1. Authentication (admin/dev only)
  const authResult = await requireAuth(['dev', 'admin'])
  if (!authResult.authorized) {
    return authResult.response as NextResponse<ApiResponse<{ emailId: string }>>
  }

  // 2. DB Connection
  await connectMongoose()

  try {
    // 3. Parse FormData
    const formData = await request.formData()
    const employeeId = formData.get('employeeId') as string
    const recipientEmail = formData.get('recipientEmail') as string
    const pdfFile = formData.get('pdf') as File

    // 4. Validation
    if (!employeeId) {
      return errorResponse('Données manquantes', 'employeeId est requis', 400)
    }

    if (!recipientEmail) {
      return errorResponse('Données manquantes', 'recipientEmail est requis', 400)
    }

    if (!pdfFile) {
      return errorResponse('Données manquantes', 'Le fichier PDF est requis', 400)
    }

    // 5. Fetch employee
    const employee = await Employee.findById(employeeId)
    if (!employee) {
      return errorResponse('Employé introuvable', `Aucun employé avec l'ID ${employeeId}`, 404)
    }

    const employeeData = employee.toObject() as EmployeeType

    // 6. Convert PDF File to Buffer for Resend
    const pdfArrayBuffer = await pdfFile.arrayBuffer()
    const pdfBuffer = Buffer.from(pdfArrayBuffer)

    // 7. Send email with Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: recipientEmail,
      subject: `Contrat de travail CDI - ${employeeData.firstName} ${employeeData.lastName}`,
      html: generateEmailHTML(employeeData),
      attachments: [
        {
          filename: pdfFile.name,
          content: pdfBuffer,
        },
      ],
    })

    if (emailError) {
      console.error('Email sending error:', emailError)
      return errorResponse("Erreur lors de l'envoi de l'email", emailError.message)
    }

    // 8. Update employee onboarding status
    await Employee.findByIdAndUpdate(employeeId, {
      $set: {
        'onboardingStatus.contractSent': true,
        'onboardingStatus.contractSentAt': new Date(),
        'onboardingStatus.contractSentTo': recipientEmail,
      },
    })

    // 9. Return success with email ID
    return successResponse(
      { emailId: emailData?.id || '' },
      `Email envoyé avec succès à ${recipientEmail}`
    )
  } catch (error) {
    console.error('POST /api/hr/contract/send-email error:', error)
    return errorResponse(
      "Erreur lors de l'envoi du contrat",
      error instanceof Error ? error.message : 'Erreur inconnue'
    )
  }
}

/**
 * Generate HTML content for email
 */
function generateEmailHTML(employee: EmployeeType): string {
  const isFullTime = employee.contractualHours >= 35
  const contractType = isFullTime ? 'temps complet' : 'temps partiel'

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contrat de travail CDI</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
          <h1 style="color: #2563eb; margin: 0 0 10px 0; font-size: 24px;">
            Contrat de travail CDI
          </h1>
          <p style="color: #6b7280; margin: 0; font-size: 14px;">
            ILY SARL - Coworking Café
          </p>
        </div>

        <div style="margin-bottom: 30px;">
          <p style="margin: 0 0 15px 0;">
            Bonjour <strong>${employee.firstName} ${employee.lastName}</strong>,
          </p>

          <p style="margin: 0 0 15px 0;">
            Vous trouverez ci-joint votre contrat de travail à durée indéterminée à ${contractType}.
          </p>

          <p style="margin: 0 0 15px 0;">
            <strong>Informations du contrat :</strong>
          </p>

          <ul style="margin: 0 0 15px 0; padding-left: 20px;">
            <li><strong>Poste :</strong> ${employee.employeeRole || 'Employé polyvalent'}</li>
            <li><strong>Type de contrat :</strong> CDI à ${contractType}</li>
            <li><strong>Heures contractuelles :</strong> ${employee.contractualHours}h par semaine</li>
            <li><strong>Date d'entrée :</strong> ${employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('fr-FR') : 'À définir'}</li>
          </ul>

          <p style="margin: 0 0 15px 0;">
            Merci de prendre connaissance de ce document, de le signer et de nous le retourner dans les meilleurs délais.
          </p>

          <p style="margin: 0 0 15px 0;">
            Pour toute question, n'hésitez pas à nous contacter.
          </p>
        </div>

        <div style="background-color: #f8f9fa; border-radius: 10px; padding: 20px; margin-top: 30px;">
          <p style="margin: 0 0 10px 0; font-size: 14px;">
            <strong>ILY SARL</strong><br>
            1 rue de la Division Leclerc<br>
            67000 STRASBOURG
          </p>
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            Cet email a été généré automatiquement par le système de gestion RH.
          </p>
        </div>
      </body>
    </html>
  `
}
