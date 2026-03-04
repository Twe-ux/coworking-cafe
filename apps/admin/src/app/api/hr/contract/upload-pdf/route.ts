/**
 * API Route: Upload Contract PDF to MongoDB
 * Saves contract PDF as base64 in employee document (like DPAE)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, errorResponse } from '@/lib/api/response';
import { connectMongoose } from '@/lib/mongodb';
import { Employee } from '@/models/employee';
import type { ApiResponse } from '@/types/timeEntry';

interface UploadPdfData {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * POST /api/hr/contract/upload-pdf
 * Save contract PDF in MongoDB as base64
 *
 * Request: FormData
 * - employeeId: string
 * - pdf: File (PDF blob)
 *
 * Response:
 * {
 *   success: true,
 *   data: { employee: { id, firstName, lastName } },
 *   message: "Contrat sauvegardé avec succès"
 * }
 */
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<UploadPdfData>>> {
  // 1. Authentication (admin/dev only)
  const authResult = await requireAuth(['dev', 'admin']);
  if (!authResult.authorized) {
    return authResult.response as NextResponse<ApiResponse<UploadPdfData>>;
  }

  // 2. DB Connection
  await connectMongoose();

  try {
    // 3. Parse FormData
    const formData = await request.formData();
    const employeeId = formData.get('employeeId') as string;
    const pdfFile = formData.get('pdf') as File;

    // 4. Validation
    if (!employeeId) {
      return errorResponse('Données manquantes', 'employeeId est requis', 400);
    }

    if (!pdfFile) {
      return errorResponse('Données manquantes', 'Le fichier PDF est requis', 400);
    }

    // 5. Fetch employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return errorResponse(
        'Employé introuvable',
        `Aucun employé avec l'ID ${employeeId}`,
        404
      );
    }

    // 6. Convert PDF File to base64
    const pdfArrayBuffer = await pdfFile.arrayBuffer();
    const pdfBuffer = Buffer.from(pdfArrayBuffer);
    const pdfBase64 = pdfBuffer.toString('base64');

    // 7. Update employee with contract PDF (like DPAE pattern)
    await Employee.findByIdAndUpdate(employeeId, {
      $set: {
        contractPdf: {
          filename: pdfFile.name,
          contentBase64: pdfBase64,
          uploadedAt: new Date(),
          uploadedBy: authResult.session.user.id,
        },
      },
    });

    console.log(`[upload-pdf] Contract PDF saved for ${employee.firstName} ${employee.lastName}`);

    // 8. Return success
    return successResponse(
      {
        employee: {
          id: employee._id.toString(),
          firstName: employee.firstName,
          lastName: employee.lastName,
        },
      },
      'Contrat sauvegardé avec succès en base de données'
    );
  } catch (error) {
    console.error('POST /api/hr/contract/upload-pdf error:', error);
    return errorResponse(
      'Erreur lors de la sauvegarde du contrat',
      error instanceof Error ? error.message : 'Erreur inconnue'
    );
  }
}
