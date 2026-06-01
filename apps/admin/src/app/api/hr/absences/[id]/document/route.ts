import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, errorResponse } from '@/lib/api/response';
import { connectMongoose } from '@/lib/mongodb';
import Absence from '@/models/absence';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

/**
 * POST /api/hr/absences/[id]/document
 * Upload a sick leave justification document (PDF or image)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(['dev', 'admin']);
  if (!authResult.authorized) return authResult.response;

  try {
    await connectMongoose();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return errorResponse('Fichier requis', undefined, 400);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return errorResponse('Format non supporté (PDF, JPG, PNG uniquement)', undefined, 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse('Fichier trop volumineux (5 Mo max)', undefined, 400);
    }

    const absence = await Absence.findById(params.id);
    if (!absence) {
      return errorResponse('Absence introuvable', undefined, 404);
    }

    if (absence.type !== 'sick_leave') {
      return errorResponse('Upload de justificatif réservé aux arrêts maladie', undefined, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const contentBase64 = Buffer.from(arrayBuffer).toString('base64');

    const today = new Date();
    const uploadedAt = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    absence.sickLeaveDocument = {
      filename: file.name,
      contentBase64,
      mimeType: file.type,
      uploadedAt,
    };

    await absence.save();

    return successResponse({ filename: file.name, uploadedAt });
  } catch (error) {
    console.error('Error uploading sick leave document:', error);
    return errorResponse("Erreur lors de l'upload");
  }
}

/**
 * GET /api/hr/absences/[id]/document
 * Download the sick leave justification document
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(['dev', 'admin']);
  if (!authResult.authorized) return authResult.response;

  try {
    await connectMongoose();

    const absence = await Absence.findById(params.id).lean();
    if (!absence) {
      return errorResponse('Absence introuvable', undefined, 404);
    }

    if (!absence.sickLeaveDocument?.contentBase64) {
      return errorResponse('Aucun document disponible', undefined, 404);
    }

    const buffer = Buffer.from(absence.sickLeaveDocument.contentBase64, 'base64');

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': absence.sickLeaveDocument.mimeType,
        'Content-Disposition': `attachment; filename="${absence.sickLeaveDocument.filename}"`,
        'Content-Length': String(buffer.length),
      },
    });
  } catch (error) {
    console.error('Error downloading sick leave document:', error);
    return errorResponse('Erreur lors du téléchargement');
  }
}

/**
 * DELETE /api/hr/absences/[id]/document
 * Remove the sick leave justification document
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(['dev', 'admin']);
  if (!authResult.authorized) return authResult.response;

  try {
    await connectMongoose();

    const absence = await Absence.findById(params.id);
    if (!absence) {
      return errorResponse('Absence introuvable', undefined, 404);
    }

    absence.sickLeaveDocument = undefined;
    await absence.save();

    return successResponse({ message: 'Document supprimé' });
  } catch (error) {
    console.error('Error deleting sick leave document:', error);
    return errorResponse('Erreur lors de la suppression');
  }
}
